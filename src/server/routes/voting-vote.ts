import type { RouteContext } from './types.js';
import { z } from 'zod';
import { parseRequest } from '../helpers/request.js';
import { response } from '../helpers/response.js';
import { requireAuth } from '../middleware/auth.js';
import { user } from '../repositories/user.js';
import { vote } from '../repositories/vote.js';

export { VotesRemainingResponseSchema } from '../schemas.js';

export const voteOpSchema = z.object({
  talk_id: z.number().int().positive(),
});

export const votingVote = async (ctx: RouteContext) => {
  const { request, cors, database, env } = ctx;

  const auth = await requireAuth(request, env, database, cors);
  if (auth instanceof Response) return auth;
  const u = auth.user;

  const parsed = await parseRequest(request, voteOpSchema, cors);
  if (parsed instanceof Response) return parsed;

  const usersRepo = user(database);
  const votesCast = await usersRepo.votesRemaining(u.id);
  if (votesCast >= u.votes_allowed)
    return response({ error: 'No votes remaining' }, 403, cors);

  const voteRepo = vote(database);

  const alreadyVoted = await voteRepo.hasVoted(u.id, parsed.talk_id);
  if (alreadyVoted)
    return response({ error: 'Already voted for this talk' }, 409, cors);

  await voteRepo.cast(u.id, parsed.talk_id);

  return response(
    { votes_remaining: u.votes_allowed - votesCast - 1 },
    200,
    cors
  );
};

export const votingRetract = async (ctx: RouteContext) => {
  const { request, cors, database, env } = ctx;

  const auth = await requireAuth(request, env, database, cors);
  if (auth instanceof Response) return auth;
  const u = auth.user;

  const parsed = await parseRequest(request, voteOpSchema, cors);
  if (parsed instanceof Response) return parsed;

  const voteRepo = vote(database);
  const alreadyVoted = await voteRepo.hasVoted(u.id, parsed.talk_id);
  if (!alreadyVoted) return response({ error: 'Vote not found' }, 404, cors);

  await voteRepo.retract(u.id, parsed.talk_id);
  const usersRepo = user(database);
  const votesCast = await usersRepo.votesRemaining(u.id);

  return response({ votes_remaining: u.votes_allowed - votesCast }, 200, cors);
};
