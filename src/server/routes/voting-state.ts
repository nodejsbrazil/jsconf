import type { RouteContext } from './types.js';
import { response } from '../helpers/response.js';
import { requireAuth } from '../middleware/auth.js';
import { user } from '../repositories/user.js';
import { VotingStateResponseSchema } from '../schemas.js';

export { VotingStateResponseSchema };

export const votingState = async (ctx: RouteContext) => {
  const auth = await requireAuth(ctx.request, ctx.env, ctx.database, ctx.cors);
  if (auth instanceof Response) return auth;

  const usersRepo = user(ctx.database);
  const votesCast = await usersRepo.votesRemaining(auth.user.id);
  const talks = await usersRepo.getEligibleTalks(auth.user.id);

  return response(
    {
      user: {
        id: auth.user.id,
        email: auth.user.email,
        votes_remaining: auth.user.votes_allowed - votesCast,
      },
      talks: talks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        speaker_name: t.speaker_name,
        duration: t.duration,
        audience_level: t.audience_level,
      })),
      votedTalkIds: talks.filter((t) => t.has_voted === 1).map((t) => t.id),
    },
    200,
    ctx.cors
  );
};
