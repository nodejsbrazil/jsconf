import { writeFileSync } from 'node:fs';
import Stripe from 'stripe';
import { createStripeClient } from '../src/server/configs/stripe.js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is not set.');
  process.exit(1);
}

const stripe = createStripeClient(STRIPE_SECRET_KEY);

async function main() {
  const customers: Stripe.Customer[] = [];
  const paymentIntents: Stripe.PaymentIntent[] = [];
  const charges: Stripe.Charge[] = [];

  for await (const customer of stripe.customers.list({ limit: 100 })) {
    customers.push(customer);
  }

  for await (const paymentIntent of stripe.paymentIntents.list({
    limit: 100,
  })) {
    paymentIntents.push(paymentIntent);
  }

  for await (const charge of stripe.charges.list({ limit: 100 })) {
    charges.push(charge);
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    customers,
    paymentIntents,
    charges,
  };

  writeFileSync(
    'src/server/routes/transactions.json',
    JSON.stringify(output, null, 2)
  );

  console.log(
    `Fetched ${customers.length} customers, ${paymentIntents.length} payment intents, ${charges.length} charges. Written to src/server/routes/transactions.json`
  );

  const sessionsWithQuantity = paymentIntents.filter(
    (pi) => pi.metadata?.quantity
  );
  const totalTickets = sessionsWithQuantity.reduce(
    (sum, pi) => sum + parseInt(pi.metadata.quantity || '1', 10),
    0
  );

  console.log(
    `\nQuantity summary: ${sessionsWithQuantity.length} of ${paymentIntents.length} payment intents have quantity metadata.`
  );
  console.log(`Total tickets (from metadata.quantity): ${totalTickets}`);
}

main().catch((err) => {
  console.error('Failed to fetch Stripe data:', err);
  process.exit(1);
});
