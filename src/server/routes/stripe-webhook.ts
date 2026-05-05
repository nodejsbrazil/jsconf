import type Stripe from 'stripe';
import type { Database, Env } from '../types.js';
import { z } from 'zod';
import { createStripeClient, cryptoProvider } from '../configs/stripe.js';
import { response } from '../helpers/response.js';
import { user } from '../repositories/user.js';

type Options = {
  request: Request;
  cors: Record<string, string>;
  env: Env;
  database: Database;
};

// need to update this with the actual date in the future
const EARLY_BIRD_CUTOFF = new Date('2026-12-31T23:59:59Z').getTime() / 1000;

const TICKET_WEIGHTS: Record<number, number> = {
  1: 1,
  2: 3,
};

export type ExtractedUserData = {
  email: string;
  ticketType: number;
  quantity: number;
  votesAllowed: number;
};

export const chargeRefundedSchema = z.object({
  billing_details: z
    .object({
      email: z.string().nullable(),
    })
    .nullable(),
  receipt_email: z.string().nullable(),
  payment_intent: z.string().nullable(),
});

export const extractUserData = (
  session: Stripe.Checkout.Session
): ExtractedUserData | null => {
  const email = session.customer_email ?? null;
  if (!email) return null;

  const created = typeof session.created === 'number' ? session.created : 0;
  const ticketType = created <= EARLY_BIRD_CUTOFF ? 2 : 1;

  const rawQuantity = session.metadata?.['quantity'];
  const quantity = rawQuantity ? parseInt(rawQuantity, 10) : 1;
  if (isNaN(quantity) || quantity < 1) return null;

  const weight = TICKET_WEIGHTS[ticketType] ?? 0;
  const votesAllowed = quantity * weight;
  if (votesAllowed === 0) return null;

  return { email, ticketType, quantity, votesAllowed };
};

export const handleEvent = async (
  event: Stripe.Event,
  database: Database
): Promise<boolean> => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const data = extractUserData(session);
      if (!data) return true;

      await user(database).insertBatch([
        {
          email: data.email,
          ticket_type: data.ticketType,
          votes_allowed: data.votesAllowed,
          quantity: data.quantity,
        },
      ]);
      return true;
    }
    case 'payment_intent.succeeded':
    case 'charge.succeeded':
      return true;
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const email =
        charge.billing_details?.email ?? charge.receipt_email ?? null;

      if (!email) return true;

      await user(database).revoke(email);
      return true;
    }
    default:
      return false;
  }
};

export const stripeWebhook = async ({
  request,
  cors,
  env,
  database,
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

    await handleEvent(event, database);

    return response({ received: true }, 200, cors);
  } catch {
    return response(
      { error: 'Webhook signature verification failed.' },
      400,
      cors
    );
  }
};
