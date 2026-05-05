import { login } from './routes/auth/login.js';
import { logout } from './routes/auth/logout.js';
import { refresh } from './routes/auth/refresh.js';
import { requestCode } from './routes/auth/request-code.js';
import { c4p } from './routes/c4p.js';
import { stripeWebhook } from './routes/stripe-webhook.js';
import { usersBatch } from './routes/users-batch.js';
import { votingState } from './routes/voting-state.js';
import { votingRetract, votingVote } from './routes/voting-vote.js';
import { waitlist } from './routes/waitlist.js';

export const routes = {
  c4p,
  waitlist,
  stripeWebhook,
  usersBatch,
  login,
  votingState,
  votingVote,
  votingRetract,
  requestCode,
  refresh,
  logout,
};
