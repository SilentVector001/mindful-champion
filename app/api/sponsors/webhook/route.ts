
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe as getStripe } from '@/lib/sponsor-stripe';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const webhookSecret = process.env.STRIPE_SPONSOR_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  const sponsorId = session.metadata?.sponsorId;
  const tier = session.metadata?.tier;
  const companyName = session.metadata?.companyName;

  if (!sponsorId) {
    console.error('No sponsorId in checkout session metadata');
    return;
  }

  // Get the subscription
  const stripe = getStripe();
  const subscriptionData = await stripe.subscriptions.retrieve(session.subscription as string);
  const subscription = subscriptionData as any; // Type workaround for Stripe response

  // Find or create the sponsor profile
  const application = await prisma.sponsorApplication.findUnique({
    where: { id: sponsorId },
  });

  if (!application) {
    console.error('Application not found:', sponsorId);
    return;
  }

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email: application.email },
  });

  // Create user and sponsor profile if they don't exist
  if (!user) {
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user = await prisma.user.create({
      data: {
        email: application.email,
        name: application.contactPerson,
        password: hashedPassword,
        role: 'SPONSOR',
        sponsorProfile: {
          create: {
            companyName: application.companyName,
            website: application.website,
            contactPerson: application.contactPerson,
            contactEmail: application.email,
            contactPhone: application.phone,
            description: application.description,
            industry: application.industry,
            partnershipTier: tier,
            isApproved: true,
            approvedAt: new Date(),
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            billingStartDate: new Date((subscription.current_period_start as number) * 1000),
            billingEndDate: new Date((subscription.current_period_end as number) * 1000),
          },
        },
      },
    });

    // Send welcome email with credentials
    await sendWelcomeEmail(application, tempPassword);
  } else {
    // Update existing sponsor profile
    await prisma.sponsorProfile.update({
      where: { userId: user.id },
      data: {
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        billingStartDate: new Date((subscription.current_period_start as number) * 1000),
        billingEndDate: new Date((subscription.current_period_end as number) * 1000),
        isApproved: true,
        approvedAt: new Date(),
      },
    });
  }

  // Update application status
  await prisma.sponsorApplication.update({
    where: { id: sponsorId },
    data: {
      status: 'APPROVED',
      reviewedAt: new Date(),
    },
  });
}

async function handleSubscriptionUpdate(subscription: any) {
  const sponsorProfile = await prisma.sponsorProfile.findUnique({
    where: { stripeSubscriptionId: subscription.id as string },
  });

  if (!sponsorProfile) {
    console.error('Sponsor profile not found for subscription:', subscription.id);
    return;
  }

  await prisma.sponsorProfile.update({
    where: { id: sponsorProfile.id },
    data: {
      subscriptionStatus: subscription.status,
      billingStartDate: new Date((subscription.current_period_start as number) * 1000),
      billingEndDate: new Date((subscription.current_period_end as number) * 1000),
    },
  });
}

async function handleSubscriptionCancelled(subscription: any) {
  const sponsorProfile = await prisma.sponsorProfile.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!sponsorProfile) {
    console.error('Sponsor profile not found for subscription:', subscription.id);
    return;
  }

  await prisma.sponsorProfile.update({
    where: { id: sponsorProfile.id },
    data: {
      subscriptionStatus: 'cancelled',
      isApproved: false,
    },
  });

  // Deactivate all sponsor products
  await prisma.sponsorProduct.updateMany({
    where: { sponsorId: sponsorProfile.id },
    data: { isActive: false },
  });
}

async function handlePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription;
  
  if (!subscriptionId) return;

  const sponsorProfile = await prisma.sponsorProfile.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!sponsorProfile) return;

  await prisma.sponsorProfile.update({
    where: { id: sponsorProfile.id },
    data: {
      lastPaymentDate: new Date(),
      paymentFailedCount: 0,
    },
  });
}

async function handlePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription;
  
  if (!subscriptionId) return;

  const sponsorProfile = await prisma.sponsorProfile.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!sponsorProfile) return;

  const failedCount = (sponsorProfile.paymentFailedCount || 0) + 1;

  await prisma.sponsorProfile.update({
    where: { id: sponsorProfile.id },
    data: {
      paymentFailedCount: failedCount,
      subscriptionStatus: 'past_due',
    },
  });

  // Send payment failure notification
  if (failedCount >= 3) {
    await sendPaymentFailureEmail(sponsorProfile);
  }
}

async function sendWelcomeEmail(application: any, tempPassword: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: application.email,
    subject: 'Welcome to Mindful Champion Sponsor Program! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #06B6D4, #0891B2); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🎉 Welcome to Mindful Champion!</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #06B6D4;">Payment Confirmed!</h2>
            <p>Congratulations! Your sponsorship payment has been processed successfully.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Your Sponsor Account:</h3>
              <p><strong>Email:</strong> ${application.email}<br>
              <strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
              <p style="margin-top: 20px;">
                <a href="${process.env.NEXTAUTH_URL}/auth/signin" style="background: linear-gradient(135deg, #06B6D4, #0891B2); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Login to Your Dashboard</a>
              </p>
            </div>

            <h3>Get Started:</h3>
            <ol>
              <li>Login with your credentials above</li>
              <li>Change your password (Settings → Security)</li>
              <li>Upload your company logo</li>
              <li>Add products to the rewards marketplace</li>
              <li>Start tracking your performance</li>
            </ol>

            <p style="margin-top: 30px; color: #6b7280;">Questions? Contact us at <a href="mailto:partnerships@mindfulchampion.com">partnerships@mindfulchampion.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

async function sendPaymentFailureEmail(sponsor: any) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: sponsor.contactEmail,
    subject: '⚠️ Payment Failed - Mindful Champion Sponsorship',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #DC2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">⚠️ Payment Failed</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hello ${sponsor.contactPerson},</p>
            <p>We were unable to process your sponsorship payment for <strong>${sponsor.companyName}</strong>.</p>
            
            <p><strong>Action Required:</strong> Please update your payment method to avoid service interruption.</p>
            
            <p style="margin-top: 20px;">
              <a href="${process.env.NEXTAUTH_URL}/sponsor-billing" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Update Payment Method</a>
            </p>

            <p style="margin-top: 30px; color: #6b7280;">Questions? Contact us at <a href="mailto:partnerships@mindfulchampion.com">partnerships@mindfulchampion.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
