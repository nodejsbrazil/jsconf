import Stripe from 'stripe';

export const createStripeClient = (apiKey: string): Stripe =>
  new Stripe(apiKey, {
    apiVersion: '2026-03-25.dahlia',
    httpClient: Stripe.createFetchHttpClient(),
  });

export const cryptoProvider = Stripe.createSubtleCryptoProvider();
