import type { Database, Env } from '../types.js';
import { z } from 'zod';
import { isVotingOpen, VOTE_CLOSES_AT } from '../configs/vote.js';
import {
  isJsonContentType,
  isWithinSize,
  parseBody,
} from '../helpers/request.js';
import { response } from '../helpers/response.js';
import { getUserId } from '../helpers/session.js';
import { resolveBudget } from '../repositories/attendees.js';
import { vote as repository } from '../repositories/vote.js';

type Options = {
  request: Request;
  cors: Record<string, string>;
  database: Database;
  env: Env;
};

const submitSchema = z.object({
  talkId: z.coerce.number().int().positive(),
  action: z.enum(['add', 'remove']).default('add'),
});

export const voteGet = async ({
  request,
  cors,
  database,
  env,
}: Options): Promise<Response> => {
  const userId = await getUserId(request, env);
  if (!userId) return response({ error: 'Unauthorized.' }, 401, cors);

  const budget = await resolveBudget(env, database, userId);
  if (budget === null)
    return response({ error: 'Not an attendee.' }, 403, cors);

  const repo = repository(database);
  const [talks, myVotes] = await Promise.all([
    repo.listTalks(),
    repo.listUserVotes(userId),
  ]);

  return response(
    { budget, used: myVotes.length, talks, myVotes, closesAt: VOTE_CLOSES_AT },
    200,
    cors
  );
};

export const voteSubmit = async ({
  request,
  cors,
  database,
  env,
}: Options): Promise<Response> => {
  if (!isJsonContentType(request))
    return response({ error: 'Unsupported content type.' }, 415, cors);

  const userId = await getUserId(request, env);
  if (!userId) return response({ error: 'Unauthorized.' }, 401, cors);

  if (!isVotingOpen()) return response({ error: 'Voting closed.' }, 403, cors);

  const text = await request.text();
  if (!isWithinSize(text, 1024))
    return response({ error: 'Payload too large.' }, 413, cors);

  const body = parseBody(text);
  if (!body) return response({ error: 'Invalid JSON.' }, 400, cors);

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return response({ error: 'Invalid input.' }, 422, cors);

  const budget = await resolveBudget(env, database, userId);
  if (budget === null)
    return response({ error: 'Not an attendee.' }, 403, cors);

  const repo = repository(database);

  if (parsed.data.action === 'remove') {
    await repo.removeVote(userId, parsed.data.talkId);
    return response({ success: true }, 200, cors);
  }

  const result = await repo.castVote(userId, parsed.data.talkId, budget);
  if (!result.success)
    return response({ error: 'Vote limit reached.' }, 422, cors);

  return response({ success: true }, 200, cors);
};
