import type { Database, Env } from '../../../src/server/types.js';
import { assert, describe, it } from 'poku';
import {
  signSession,
  verifySession,
} from '../../../src/server/helpers/session.js';
import { routes } from '../../../src/server/routes.js';

const cors = { 'Access-Control-Allow-Origin': '*' };

type AuditRow = {
  actor_id: string;
  actor_name: string | null;
  action: string;
  user_id: string;
  talk_id: number;
};

type Vote = { user_id: string; talk_id: number; created_at: string };

type Mock = { database: Database; votes: Vote[]; audit: AuditRow[] };

// D1 stand-in: a plain object implementing prepare().bind().run()/all(), matching the shape the
// other route tests use. Branches on the SQL text because that is all the real driver gets.
const makeMock = (seed: Vote[] = []): Mock => {
  const votes = [...seed];
  const audit: AuditRow[] = [];
  return {
    votes,
    audit,
    database: {
      prepare: (sql: string) => ({
        bind: (...values: unknown[]) => ({
          run: async () => {
            if (sql.includes('INTO c4p_vote_audit')) {
              audit.push({
                actor_id: values[0] as string,
                actor_name: values[1] as string | null,
                action: values[2] as string,
                user_id: values[3] as string,
                talk_id: values[4] as number,
              });
              return;
            }
            if (sql.startsWith('DELETE')) {
              const index = votes.findIndex(
                (row) => row.user_id === values[0] && row.talk_id === values[1]
              );
              if (index >= 0) votes.splice(index, 1);
            }
          },
          all: async <T>() => {
            if (sql.includes('c4p_vote_audit'))
              return { results: audit as T[] };
            if (sql.includes('COUNT(v.id)'))
              return {
                results: [
                  { talk_id: 1, title: 'A', votes: 2 },
                  { talk_id: 2, title: 'B', votes: 0 },
                ] as T[],
              };
            if (sql.includes('ROW_NUMBER()'))
              return {
                results: votes
                  .filter((row) => row.talk_id === values[0])
                  .map((row, index) => ({
                    ...row,
                    position: index + 1,
                  })) as T[],
              };
            if (sql.includes('ticket_tiers'))
              return {
                results: [{ name: 'Super Early Bird', budget: 5 }] as T[],
              };
            return { results: [] as T[] };
          },
        }),
      }),
    },
  };
};

// ENVIRONMENT=development activates the X-Dev-User / X-Dev-Admin bypass these tests log in with.
const makeEnv = (): Env =>
  ({
    ENVIRONMENT: 'development',
    GUILD_OAUTH_CLIENT_ID: 'id',
    GUILD_OAUTH_CLIENT_SECRET: 'secret',
    GUILD_ORG_REFRESH_TOKEN: 'refresh',
  }) as Env;

const req = (
  url: string,
  init: { admin?: boolean; user?: string; body?: unknown } = {}
): Request => {
  const headers: Record<string, string> = {
    'X-Dev-User': init.user ?? 'organizer-1',
  };
  if (init.admin) headers['X-Dev-Admin'] = '1';
  if (init.body) headers['Content-Type'] = 'application/json';
  return new Request(`http://localhost${url}`, {
    method: init.body ? 'POST' : 'GET',
    headers,
    ...(init.body ? { body: JSON.stringify(init.body) } : {}),
  });
};

// Stands in for guild.host: the manager token mint plus the paged attendee roster.
const stubGuild = (attendees: unknown[]): (() => void) => {
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/oauth/token'))
      return new Response(
        JSON.stringify({ access_token: 'manager-token', expires_in: 3600 }),
        { status: 200 }
      );
    if (url.includes('/attendees'))
      return new Response(
        JSON.stringify({
          edges: attendees.map((node) => ({ node })),
          pageInfo: { hasNextPage: false, endCursor: null },
        }),
        { status: 200 }
      );
    return new Response('{}', { status: 404 });
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
};

const attendee = (
  userId: string,
  first: string,
  last: string,
  tier: string
) => ({
  userId,
  user: { firstName: first, lastName: last },
  ticketOrder: {
    eventTicketOrderItems: { nodes: [{ eventTicketingTier: { name: tier } }] },
  },
});

describe('helpers.session admin claim', async () => {
  await it('round-trips the admin claim when true', async () => {
    const token = await signSession('user-1', 5, 'secret', 86400, {
      admin: true,
    });
    const session = await verifySession(token, 'secret');
    assert.equal(session?.admin, true);
  });

  // Written only when true, so a non-admin session has no claim to tamper with at all.
  await it('omits the claim entirely for a non-admin', async () => {
    const token = await signSession('user-1', 5, 'secret', 86400, {
      admin: false,
    });
    const session = await verifySession(token, 'secret');
    assert.equal(session?.admin, undefined);
  });
});

describe('routes.adminVotes', async () => {
  await it('rejects an anonymous caller with 401', async () => {
    const res = await routes.adminVotes({
      request: new Request('http://localhost/api/admin/votes'),
      cors,
      database: makeMock().database,
      env: makeEnv(),
    });
    assert.equal(res.status, 401);
  });

  await it('rejects a logged-in non-admin with 403', async () => {
    const res = await routes.adminVotes({
      request: req('/api/admin/votes'),
      cors,
      database: makeMock().database,
      env: makeEnv(),
    });
    assert.equal(res.status, 403);
  });

  await it('returns per-talk counts and the total for an admin', async () => {
    const res = await routes.adminVotes({
      request: req('/api/admin/votes', { admin: true }),
      cors,
      database: makeMock().database,
      env: makeEnv(),
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      talks: [
        { talkId: 1, title: 'A', votes: 2 },
        { talkId: 2, title: 'B', votes: 0 },
      ],
      total: 2,
    });
  });
});

describe('routes.adminVoteDetail', async () => {
  await it('joins each vote to the attendee name, tier and tier budget', async () => {
    const restore = stubGuild([
      attendee('u1', 'Ada', 'Lovelace', 'Super Early Bird'),
    ]);
    const mock = makeMock([
      { user_id: 'u1', talk_id: 1, created_at: '2026-08-01 10:00:00' },
    ]);
    const res = await routes.adminVoteDetail({
      request: req('/api/admin/votes/detail?talkId=1', { admin: true }),
      cors,
      database: mock.database,
      env: makeEnv(),
    });
    restore();

    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      talkId: 1,
      rosterAvailable: true,
      votes: [
        {
          userId: 'u1',
          name: 'Ada Lovelace',
          tier: 'Super Early Bird',
          budget: 5,
          position: 1,
          votedAt: '2026-08-01 10:00:00',
        },
      ],
    });
  });

  // A refunded or departed attendee is gone from guild's roster, but the vote row still exists and
  // an organizer needs to see it, so the row degrades instead of disappearing.
  await it('keeps a vote whose voter is missing from the roster', async () => {
    const restore = stubGuild([]);
    const mock = makeMock([
      { user_id: 'ghost', talk_id: 1, created_at: '2026-08-01 10:00:00' },
    ]);
    const res = await routes.adminVoteDetail({
      request: req('/api/admin/votes/detail?talkId=1', { admin: true }),
      cors,
      database: mock.database,
      env: makeEnv(),
    });
    restore();

    const body = (await res.json()) as {
      votes: { userId: string; name: null; tier: null; budget: number }[];
    };
    assert.equal(body.votes.length, 1);
    assert.equal(body.votes[0]?.userId, 'ghost');
    assert.equal(body.votes[0]?.name, null);
    assert.equal(body.votes[0]?.tier, null);
    assert.equal(body.votes[0]?.budget, 1);
  });

  await it('rejects a missing or non-numeric talk id with 422', async () => {
    const res = await routes.adminVoteDetail({
      request: req('/api/admin/votes/detail?talkId=abc', { admin: true }),
      cors,
      database: makeMock().database,
      env: makeEnv(),
    });
    assert.equal(res.status, 422);
  });

  await it('rejects a non-admin with 403 before touching guild', async () => {
    const res = await routes.adminVoteDetail({
      request: req('/api/admin/votes/detail?talkId=1'),
      cors,
      database: makeMock().database,
      env: makeEnv(),
    });
    assert.equal(res.status, 403);
  });
});

describe('routes.adminRemoveVote', async () => {
  await it('deletes the vote and records who did it', async () => {
    const mock = makeMock([
      { user_id: 'u1', talk_id: 1, created_at: '2026-08-01 10:00:00' },
    ]);
    const res = await routes.adminRemoveVote({
      request: req('/api/admin/votes/remove', {
        admin: true,
        body: { userId: 'u1', talkId: 1 },
      }),
      cors,
      database: mock.database,
      env: makeEnv(),
    });

    assert.equal(res.status, 200);
    assert.equal(mock.votes.length, 0);
    assert.deepEqual(mock.audit, [
      {
        actor_id: 'organizer-1',
        actor_name: null,
        action: 'remove',
        user_id: 'u1',
        talk_id: 1,
      },
    ]);
  });

  await it('rejects a non-admin with 403 and leaves the vote alone', async () => {
    const mock = makeMock([
      { user_id: 'u1', talk_id: 1, created_at: '2026-08-01 10:00:00' },
    ]);
    const res = await routes.adminRemoveVote({
      request: req('/api/admin/votes/remove', {
        body: { userId: 'u1', talkId: 1 },
      }),
      cors,
      database: mock.database,
      env: makeEnv(),
    });

    assert.equal(res.status, 403);
    assert.equal(mock.votes.length, 1);
    assert.equal(mock.audit.length, 0);
  });

  await it('rejects a malformed body with 422', async () => {
    const res = await routes.adminRemoveVote({
      request: req('/api/admin/votes/remove', {
        admin: true,
        body: { userId: '', talkId: -1 },
      }),
      cors,
      database: makeMock().database,
      env: makeEnv(),
    });
    assert.equal(res.status, 422);
  });
});

describe('routes.adminAudit', async () => {
  await it('returns the log entries for an admin', async () => {
    const mock = makeMock([
      { user_id: 'u1', talk_id: 1, created_at: '2026-08-01 10:00:00' },
    ]);
    await routes.adminRemoveVote({
      request: req('/api/admin/votes/remove', {
        admin: true,
        body: { userId: 'u1', talkId: 1 },
      }),
      cors,
      database: mock.database,
      env: makeEnv(),
    });

    const res = await routes.adminAudit({
      request: req('/api/admin/audit', { admin: true }),
      cors,
      database: mock.database,
      env: makeEnv(),
    });
    const body = (await res.json()) as {
      entries: { actorId: string; userId: string; action: string }[];
    };
    assert.equal(res.status, 200);
    assert.equal(body.entries.length, 1);
    assert.equal(body.entries[0]?.actorId, 'organizer-1');
    assert.equal(body.entries[0]?.action, 'remove');
  });

  await it('rejects a non-admin with 403', async () => {
    const res = await routes.adminAudit({
      request: req('/api/admin/audit'),
      cors,
      database: makeMock().database,
      env: makeEnv(),
    });
    assert.equal(res.status, 403);
  });
});
