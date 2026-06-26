import { authCallback, authLogin } from './routes/auth.js';
import { c4p } from './routes/c4p.js';
import { stripeWebhook } from './routes/stripe-webhook.js';
import { voteGet, voteSubmit } from './routes/vote.js';
import { waitlist } from './routes/waitlist.js';

export const routes = {
  c4p,
  waitlist,
  stripeWebhook,
  voteGet,
  voteSubmit,
  authLogin,
  authCallback,
};
