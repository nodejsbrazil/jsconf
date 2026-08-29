import type { Attendee } from '../helpers/oauth.js';
import type { Session } from '../helpers/session.js';
import type { Database, Env } from '../types.js';
import { z } from 'zod';
import { EVENT_SLUG } from '../configs/oauth.js';
import { fetchAttendeeRoster, managerAccessToken } from '../helpers/oauth.js';
import { parseRequest } from '../helpers/request.js';
import { response } from '../helpers/response.js';
import { getSession } from '../helpers/session.js';
import { vote as repository } from '../repositories/vote.js';

type Options = {
  request: Request;
  cors: Record<string, string>;
  database: Database;
  env: Env;
};

const removeSchema = z.object({
  userId: z.string().min(1).max(200),
  talkId: z.coerce.number().int().positive(),
});

// Every organizer endpoint starts here. The `admin` claim is written into the session JWT at login
// only after guild.host confirmed the user can manage the event, so this one check is the whole
// authorization story. 403 rather than 404 because the caller is authenticated but not allowed.
// Returns the ready-made rejection so each handler is one `instanceof Response` guard.
const requireAdmin = async (
  request: Request,
  env: Env,
  cors: Record<string, string>
): Promise<Session | Response> => {
  const session = await getSession(request, env);
  if (!session) return response({ error: 'Unauthorized.' }, 401, cors);
  if (session.admin !== true)
    return response({ error: 'Forbidden.' }, 403, cors);
  return session;
};

// Talk titles + vote counts. Pure SQL, so the dashboard's main table costs zero guild.host calls.
export const adminVotes = async ({
  request,
  cors,
  database,
  env,
}: Options): Promise<Response> => {
  const auth = await requireAdmin(request, env, cors);
  if (auth instanceof Response) return auth;

  const talks = await repository(database).talkVoteCounts();
  return response(
    {
      talks: talks.map((row) => ({
        talkId: row.talk_id,
        title: row.title,
        votes: row.votes,
      })),
      total: talks.reduce((sum, row) => sum + row.votes, 0),
    },
    200,
    cors
  );
};

// Who voted for one talk. `c4p_votes` stores only the guild user id, so the name and ticket tier
// come from the event attendee roster (manager token) and the budget from `ticket_tiers`.
export const adminVoteDetail = async ({
  request,
  cors,
  database,
  env,
}: Options): Promise<Response> => {
  const auth = await requireAdmin(request, env, cors);
  if (auth instanceof Response) return auth;

  const talkId = Number(new URL(request.url).searchParams.get('talkId'));
  if (!Number.isInteger(talkId) || talkId <= 0)
    return response({ error: 'Invalid talk id.' }, 422, cors);

  const repo = repository(database);
  const [votes, budgets] = await Promise.all([
    repo.votesForTalk(talkId),
    repo.tierBudgets(),
  ]);

  if (
    !env.GUILD_OAUTH_CLIENT_ID ||
    !env.GUILD_OAUTH_CLIENT_SECRET ||
    !env.GUILD_ORG_REFRESH_TOKEN
  )
    return new Response('Manager token not configured.', { status: 500 });

  const managerToken = await managerAccessToken(
    env.GUILD_OAUTH_CLIENT_ID,
    env.GUILD_OAUTH_CLIENT_SECRET,
    env.GUILD_ORG_REFRESH_TOKEN,
    database
  );
  // A roster we can't read degrades the columns, never the list: the votes still render with their
  // ids, which is what an organizer actually needs to act on.
  const roster: Map<string, Attendee> = managerToken
    ? await fetchAttendeeRoster(managerToken, EVENT_SLUG)
    : new Map();

  return response(
    {
      talkId,
      rosterAvailable: roster.size > 0,
      votes: votes.map((row) => {
        const attendee = roster.get(row.user_id);
        const tier = attendee?.tier ?? null;
        return {
          userId: row.user_id,
          name: attendee?.name ?? null,
          tier,
          // Same default budgetForTier applies: a tier with no override row is worth one vote.
          budget: tier ? (budgets.get(tier) ?? 1) : 1,
          position: row.position,
          votedAt: row.created_at,
        };
      }),
    },
    200,
    cors
  );
};

// Deletes one vote and writes who did it to the audit log. The audit row is written only after the
// delete succeeds, so the log never claims an action that didn't happen.
export const adminRemoveVote = async ({
  request,
  cors,
  database,
  env,
}: Options): Promise<Response> => {
  const auth = await requireAdmin(request, env, cors);
  if (auth instanceof Response) return auth;

  const parsed = await parseRequest(request, removeSchema, 1024);
  if ('error' in parsed)
    return response({ error: parsed.error }, parsed.status, cors);

  const repo = repository(database);
  await repo.removeVote(parsed.data.userId, parsed.data.talkId);
  await repo.recordAudit({
    actorId: auth.userId,
    actorName: auth.name,
    action: 'remove',
    userId: parsed.data.userId,
    talkId: parsed.data.talkId,
  });

  return response({ success: true }, 200, cors);
};

// The audit log itself, newest first.
export const adminAudit = async ({
  request,
  cors,
  database,
  env,
}: Options): Promise<Response> => {
  const auth = await requireAdmin(request, env, cors);
  if (auth instanceof Response) return auth;

  const entries = await repository(database).listAudit();
  return response(
    {
      entries: entries.map((row) => ({
        actorId: row.actor_id,
        actorName: row.actor_name,
        action: row.action,
        userId: row.user_id,
        talkId: row.talk_id,
        title: row.title,
        at: row.created_at,
      })),
    },
    200,
    cors
  );
};
