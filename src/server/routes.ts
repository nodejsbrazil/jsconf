import { c4p } from './routes/c4p.js';
import { stripeWebhook } from './routes/stripe-webhook.js';
import { waitlist } from './routes/waitlist.js';

export const routes = {
  c4p,
  waitlist,
  stripeWebhook,
};
