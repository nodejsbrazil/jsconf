import {
  adminAudit,
  adminRemoveVote,
  adminVoteDetail,
  adminVotes,
} from './routes/admin.js';
import { authCallback, authLogin, authLogout, authMe } from './routes/auth.js';
import { c4p } from './routes/c4p.js';
import { voteGet, voteSubmit } from './routes/vote.js';
import { waitlist } from './routes/waitlist.js';

export const routes = {
  c4p,
  waitlist,
  voteGet,
  voteSubmit,
  authLogin,
  authLogout,
  authMe,
  authCallback,
  adminVotes,
  adminVoteDetail,
  adminRemoveVote,
  adminAudit,
};
