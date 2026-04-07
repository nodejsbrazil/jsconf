import type Stripe from 'stripe';
import type { Env } from '../types.js';
import { createStripeClient, cryptoProvider } from '../configs/stripe.js';
import { response } from '../helpers/response.js';

type Options = {
  request: Request;
  cors: Record<string, string>;
  env: Env;
};

export const handleEvent = (event: Stripe.Event): boolean => {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'payment_intent.succeeded':
    case 'charge.succeeded':
    case 'charge.refunded':
      return true;
    default:
      return false;
  }
};

export const stripeWebhook = async ({
  request,
  cors,
  env,
}: Options): Promise<Response> => {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return response({ error: 'Missing signature.' }, 400, cors);

  const body = await request.text();
  const stripe = createStripeClient(env.STRIPE_SECRET_KEY);

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
      undefined,
      cryptoProvider
    );

    handleEvent(event);

    return response({ received: true }, 200, cors);
  } catch {
    return response(
      { error: 'Webhook signature verification failed.' },
      400,
      cors
    );
  }
};
