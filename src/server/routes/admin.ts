import type { Session } from '../helpers/session.js';
import type { RosterEntry } from '../repositories/vote.js';
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
  /** Only the summary route passes this, to warm the roster after responding. */
  ctx?: ExecutionContext;
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
//
// Opening the page is also the moment to warm the roster. The walk takes about 11 seconds (16
// sequential guild requests), and doing it lazily meant the first drill-down click paid for it.
// `ctx.waitUntil()` keeps the walk alive after this response is sent, so it runs while the
// organizer is still reading the table and the click that follows hits a warm cache.
export const adminVotes = async ({
  request,
  cors,
  database,
  env,
  ctx,
}: Options): Promise<Response> => {
  const auth = await requireAdmin(request, env, cors);
  if (auth instanceof Response) return auth;

  // Nothing is awaited here: a slow or failing guild must never delay or break the summary, which
  // is pure SQL and is the only thing this endpoint promises.
  if (ctx)
    ctx.waitUntil(
      resolveRoster(database, env, []).catch(() => {
        // Swallowed on purpose: a failed warm-up just leaves the drill-down to walk on demand,
        // exactly the behaviour it had before, and an unhandled rejection here would be logged as
        // a worker error for something purely optional.
      })
    );

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

// How long a cached roster is trusted before the guild walk is paid for again. Attendees only
// change when someone buys a ticket, and a voter missing from the cache forces a refresh anyway
// (see below), so this can be generous.
const ROSTER_TTL_SECONDS = 3600;

/**
 * The attendee roster, from D1 when it is fresh enough and from guild otherwise.
 *
 * guild exposes no lookup-by-id, so resolving a single attendee means walking the whole paginated
 * list at 20 per request. At 311 attendees that is 16 sequential requests, roughly 11 seconds, and
 * doing it per drill-down click made the panel unusable. The walk now runs only when the cache is
 * stale or when a voter we were asked about is missing from it, which covers an attendee who
 * bought a ticket since the last sync without needing a short TTL.
 *
 * ponytail: the refresh is synchronous, so the unlucky request that finds a stale cache still
 * waits for the walk. Move it behind ctx.waitUntil (serve stale, refresh in the background) if
 * that one slow request per hour ever matters.
 */
const resolveRoster = async (
  database: Database,
  env: Env,
  expectedUserIds: string[]
): Promise<{ roster: Map<string, RosterEntry>; fresh: boolean }> => {
  const repo = repository(database);
  const { roster, syncedAt } = await repo.cachedRoster();
  const now = Math.floor(Date.now() / 1000);

  const stale = now - syncedAt > ROSTER_TTL_SECONDS;
  const missing = expectedUserIds.some((id) => !roster.has(id));
  if (roster.size > 0 && !stale && !missing) return { roster, fresh: true };

  if (
    !env.GUILD_OAUTH_CLIENT_ID ||
    !env.GUILD_OAUTH_CLIENT_SECRET ||
    !env.GUILD_ORG_REFRESH_TOKEN
  )
    return { roster, fresh: roster.size > 0 };

  const managerToken = await managerAccessToken(
    env.GUILD_OAUTH_CLIENT_ID,
    env.GUILD_OAUTH_CLIENT_SECRET,
    env.GUILD_ORG_REFRESH_TOKEN,
    database
  );
  if (!managerToken) return { roster, fresh: roster.size > 0 };

  const walked = await fetchAttendeeRoster(managerToken, EVENT_SLUG);
  // A failed or empty walk keeps whatever was cached: stale names beat blank ones.
  if (walked.size === 0) return { roster, fresh: roster.size > 0 };

  await repo.saveRoster(walked, now);
  return { roster: walked, fresh: true };
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

  // A roster we can't read degrades the columns, never the list: the votes still render with their
  // ids, which is what an organizer actually needs to act on.
  const { roster } = await resolveRoster(
    database,
    env,
    votes.map((row) => row.user_id)
  );

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

// Every vote one person cast, for the per-voter drill-down. Same identity join as the per-talk
// view, so a voter's budget and "N of M" numbering read the same in both places.
export const adminVoterDetail = async ({
  request,
  cors,
  database,
  env,
}: Options): Promise<Response> => {
  const auth = await requireAdmin(request, env, cors);
  if (auth instanceof Response) return auth;

  const userId = new URL(request.url).searchParams.get('userId');
  if (!userId) return response({ error: 'Missing user id.' }, 422, cors);

  const repo = repository(database);
  const [votes, budgets] = await Promise.all([
    repo.votesByUser(userId),
    repo.tierBudgets(),
  ]);

  const { roster } = await resolveRoster(database, env, [userId]);
  const attendee = roster.get(userId);
  const tier = attendee?.tier ?? null;

  return response(
    {
      userId,
      name: attendee?.name ?? null,
      tier,
      budget: tier ? (budgets.get(tier) ?? 1) : 1,
      votes: votes.map((row) => ({
        talkId: row.talk_id,
        title: row.title,
        position: row.position,
        votedAt: row.created_at,
      })),
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
