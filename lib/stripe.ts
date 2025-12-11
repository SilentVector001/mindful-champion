
import Stripe from 'stripe';

// Lazy-loaded Stripe instance to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

export const stripe = getStripe;

// Subscription tier configurations
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: [
      'Basic training videos',
      'Limited drill library',
      'Community access',
      'Progress tracking',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 29,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    features: [
      'Full training video library',
      'Advanced drill programs',
      'Video analysis (5/month)',
      'AI coaching sessions',
      'Goal tracking & achievements',
      'Priority support',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      'Everything in Premium',
      'Unlimited video analysis',
      'Personal AI coach (Coach Kai)',
      'Custom training programs',
      'Tournament preparation',
      'Advanced analytics',
      '1-on-1 consultation',
    ],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
