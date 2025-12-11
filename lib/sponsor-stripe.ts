
import Stripe from 'stripe';

// Lazy-loaded Stripe instance to avoid build-time errors
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });
  }
  return stripe;
}

// Sponsorship tier pricing configuration
export const SPONSOR_TIERS = {
  bronze: {
    name: 'Bronze Partner',
    priceMonthly: 50000, // $500 in cents
    stripePriceId: process.env.STRIPE_BRONZE_PRICE_ID!,
    features: [
      'Logo on rewards marketplace',
      'Up to 3 products in catalog',
      'Basic analytics dashboard',
      'Monthly performance reports',
    ],
  },
  silver: {
    name: 'Silver Partner',
    priceMonthly: 150000, // $1,500 in cents
    stripePriceId: process.env.STRIPE_SILVER_PRICE_ID!,
    features: [
      'Everything in Bronze',
      'Featured sponsor badge',
      'Up to 10 products in catalog',
      'Priority product placement',
      'Bi-weekly analytics',
    ],
  },
  gold: {
    name: 'Gold Partner',
    priceMonthly: 350000, // $3,500 in cents
    stripePriceId: process.env.STRIPE_GOLD_PRICE_ID!,
    features: [
      'Everything in Silver',
      'Homepage hero logo placement',
      'Unlimited product listings',
      'Custom branded landing page',
      'Weekly analytics & strategy calls',
    ],
  },
  platinum: {
    name: 'Platinum Partner',
    priceMonthly: 0, // Custom pricing
    stripePriceId: '', // Contact sales
    features: [
      'Everything in Gold',
      'Exclusive partnership status',
      'Co-branded feature development',
      'Major event naming rights',
      'Real-time analytics API access',
    ],
  },
};

export async function createSponsorCheckoutSession(
  sponsorEmail: string,
  sponsorId: string,
  tier: keyof typeof SPONSOR_TIERS,
  companyName: string
) {
  if (tier === 'platinum') {
    throw new Error('Platinum tier requires custom pricing. Please contact sales.');
  }

  const tierConfig = SPONSOR_TIERS[tier];
  const stripeInstance = getStripe();

  const session = await stripeInstance.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: sponsorEmail,
    client_reference_id: sponsorId,
    line_items: [
      {
        price: tierConfig.stripePriceId,
        quantity: 1,
      },
    ],
    metadata: {
      sponsorId,
      tier,
      companyName,
    },
    subscription_data: {
      metadata: {
        sponsorId,
        tier,
        companyName,
      },
    },
    success_url: `${process.env.NEXTAUTH_URL}/sponsor-welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/partners/become-sponsor?cancelled=true`,
  });

  return session;
}

export async function createSponsorBillingPortalSession(
  stripeCustomerId: string,
  returnUrl?: string
) {
  const stripeInstance = getStripe();
  const session = await stripeInstance.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
  });

  return session;
}

export async function getSponsorSubscription(subscriptionId: string) {
  const stripeInstance = getStripe();
  return await stripeInstance.subscriptions.retrieve(subscriptionId);
}

export async function cancelSponsorSubscription(subscriptionId: string) {
  const stripeInstance = getStripe();
  return await stripeInstance.subscriptions.cancel(subscriptionId);
}

export { getStripe as stripe };
