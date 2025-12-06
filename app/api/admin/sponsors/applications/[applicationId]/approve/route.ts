
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { createSponsorCheckoutSession } from '@/lib/sponsor-stripe';
import nodemailer from 'nodemailer';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId: id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const application = await prisma.sponsorApplication.findUnique({
      where: { id: id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Application already approved' },
        { status: 400 }
      );
    }

    // Update application status to approved (pending payment)
    await prisma.sponsorApplication.update({
      where: { id: id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: adminUser.id,
      },
    });

    // Create Stripe checkout session
    let checkoutUrl = '';
    if (application.interestedTier !== 'platinum') {
      try {
        const checkoutSession = await createSponsorCheckoutSession(
          application.email,
          application.id,
          application.interestedTier as 'bronze' | 'silver' | 'gold',
          application.companyName
        );
        checkoutUrl = checkoutSession.url || '';
      } catch (stripeError) {
        console.error('Stripe checkout creation failed:', stripeError);
        // Continue anyway - we'll send the checkout link via email
      }
    }

    // Send approval email with next steps
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    if (application.interestedTier === 'platinum') {
      // Platinum tier requires custom pricing - send sales contact email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: application.email,
        subject: 'Mindful Champion Platinum Partnership - Next Steps',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #A855F7, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0;">🎉 Application Approved!</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
                <h2 style="color: #A855F7;">Platinum Partnership</h2>
                <p>Hi ${application.contactPerson},</p>
                <p>Congratulations! Your application for <strong>${application.companyName}</strong> has been approved for our <strong>Platinum Partnership</strong> tier.</p>
                
                <p>Our partnerships team will contact you within 24 hours to discuss:</p>
                <ul>
                  <li>Custom pricing tailored to your needs</li>
                  <li>Exclusive features and co-branding opportunities</li>
                  <li>Dedicated account management</li>
                  <li>Strategic planning for your partnership</li>
                </ul>

                <p style="margin-top: 30px; color: #6b7280;">Questions? Contact us at <a href="mailto:partnerships@mindfulchampion.com">partnerships@mindfulchampion.com</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } else {
      // Standard tiers - send checkout link
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: application.email,
        subject: 'Mindful Champion Sponsorship Approved - Complete Your Setup! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #06B6D4, #0891B2); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0;">🎉 Application Approved!</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
                <p>Hi ${application.contactPerson},</p>
                <p>Great news! Your sponsorship application for <strong>${application.companyName}</strong> has been approved!</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #06B6D4;">
                  <h3 style="margin-top: 0; color: #06B6D4;">Your Partnership Tier</h3>
                  <p style="font-size: 20px; font-weight: bold; margin: 0;">${application.interestedTier.toUpperCase()}</p>
                </div>

                <h3>Complete Your Setup:</h3>
                <p>Click the button below to complete your payment and activate your sponsorship:</p>
                
                <p style="margin: 30px 0; text-align: center;">
                  <a href="${checkoutUrl}" style="background: linear-gradient(135deg, #06B6D4, #0891B2); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">Complete Payment & Get Started</a>
                </p>

                <p style="font-size: 14px; color: #6b7280;">Once your payment is processed, you'll receive login credentials to access your sponsor dashboard where you can:</p>
                <ul style="color: #6b7280;">
                  <li>Upload your company logo</li>
                  <li>Add products to the rewards marketplace</li>
                  <li>Track performance and analytics</li>
                  <li>Manage your partnership</li>
                </ul>

                <p style="margin-top: 30px; color: #6b7280;">Questions? Contact us at <a href="mailto:partnerships@mindfulchampion.com">partnerships@mindfulchampion.com</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      checkoutUrl: application.interestedTier !== 'platinum' ? checkoutUrl : null,
      tier: application.interestedTier,
    });
  } catch (error) {
    console.error('Failed to approve application:', error);
    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    );
  }
}
