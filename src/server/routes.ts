import { stripeWebhook } from './routes/stripe-webhook.js';
import { waitlist } from './routes/waitlist.js';

export const routes = {
  waitlist,
  stripeWebhook,
};
