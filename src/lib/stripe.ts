import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const getStripeClient = (): Stripe | null => {
  if (!stripeSecretKey) {
    console.warn('STRIPE_SECRET_KEY is missing. Payments are disabled.');
    return null;
  }

  return new Stripe(stripeSecretKey, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2025-01-27' as any, // Keep it pinned to a modern stable version
  });
};

export const stripe = getStripeClient();
