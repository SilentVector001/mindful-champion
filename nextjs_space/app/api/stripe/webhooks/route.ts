
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe as getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error: any) {
    console.error('⚠️ Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  console.log(`🔔 Webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Get subscription details
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // Update Stripe customer with address information
  if (customerId && session.customer_details?.address) {
    try {
      const stripe = getStripe();
      await stripe.customers.update(customerId, {
        address: session.customer_details.address,
        name: session.customer_details.name || undefined,
        phone: session.customer_details.phone || undefined,
      });
      console.log(`✅ Updated Stripe customer ${customerId} with billing address`);
    } catch (error) {
      console.error('Error updating customer address:', error);
    }
  }

  // Prepare address data for database
  const addressData = session.customer_details?.address;
  const updateData: any = {
    subscriptionTier: tier as any,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: customerId,
    subscriptionStatus: 'ACTIVE',
    trialEndsAt: session.subscription
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      : null,
  };

  // Add billing address to user record if available
  if (addressData) {
    updateData.billingAddress = JSON.stringify({
      line1: addressData.line1,
      line2: addressData.line2,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postal_code,
      country: addressData.country,
    });
  }

  // Add customer name and phone if available
  if (session.customer_details?.name) {
    updateData.name = session.customer_details.name;
  }
  if (session.customer_details?.phone) {
    updateData.phone = session.customer_details.phone;
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  console.log(`✅ Subscription activated for user ${userId}: ${tier}`);
  console.log(`✅ Billing address saved for user ${userId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  const tier = subscription.metadata?.tier;
  const status = subscription.status;

  let subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' = 'ACTIVE';

  if (status === 'trialing') subscriptionStatus = 'TRIALING';
  else if (status === 'past_due') subscriptionStatus = 'PAST_DUE';
  else if (status === 'canceled' || status === 'unpaid') subscriptionStatus = 'CANCELED';

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier as any,
      subscriptionStatus,
      stripeSubscriptionId: subscription.id,
    },
  });

  console.log(`✅ Subscription updated for user ${userId}: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'FREE',
      subscriptionStatus: 'CANCELED',
      stripeSubscriptionId: null,
    },
  });

  console.log(`✅ Subscription canceled for user ${userId}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Subscription can be either a string ID or a Subscription object
  const subscriptionId = (invoice as any).subscription;

  if (subscriptionId && typeof subscriptionId === 'string') {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdate(subscription);
  }

  console.log(`✅ Payment succeeded for invoice ${invoice.id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: 'PAST_DUE' },
    });

    console.log(`⚠️ Payment failed for user ${user.id}`);
  }
}
