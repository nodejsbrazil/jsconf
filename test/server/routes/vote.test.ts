import type { Database, Env } from '../../../src/server/types.js';
import { assert, describe, it } from 'poku';
import { isVotingOpen } from '../../../src/server/configs/vote.js';
import {
  signSession,
  verifySession,
} from '../../../src/server/helpers/session.js';
import { getOrgAccessToken } from '../../../src/server/repositories/oauth-token.js';
import { routes } from '../../../src/server/routes.js';

const cors = { 'Access-Control-Allow-Origin': '*' };

const talks = [
  { id: 1, title: 'A', description: 'da', speaker_name: 'Ada' },
  { id: 2, title: 'B', description: 'db', speaker_name: 'Bob' },
];

const FUTURE = Math.floor(Date.now() / 1000) + 100_000;

// Stub guild.host: the attendees list (user-1 = confirmed 'Standard') and the token refresh.
globalThis.fetch = (async (input: RequestInfo | URL) => {
  const url = String(input instanceof Request ? input.url : input);
  if (url.includes('/attendees'))
    return new Response(
      JSON.stringify({
        edges: [
          {
            node: {
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              user: { id: 'user-1' },
              ticketOrder: {
                eventTicketOrderItems: {
                  nodes: [{ eventTicketingTier: { name: 'Standard' } }],
                },
              },
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  if (url.includes('/oauth/token'))
    return new Response(
      JSON.stringify({
        access_token: 'refreshed-access',
        refresh_token: 'r2',
        expires_in: 86400,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  return new Response('{}', { status: 404 });
}) as typeof fetch;

type Mock = {
  database: Database;
  votes: Set<number>;
  tokenWrites: unknown[][];
};

const makeMock = (
  seed: number[] = [],
  tokenRow: { refresh_token: string; expires_at: number } | null = {
    refresh_token: 'r1',
    expires_at: FUTURE,
  }
): Mock => {
  const votes = new Set<number>(seed);
  const tokenWrites: unknown[][] = [];
  return {
    votes,
    tokenWrites,
    database: {
      prepare: (sql: string) => ({
        bind: (...values: unknown[]) => ({
          run: async () => {
            if (sql.includes('INTO c4p_votes')) votes.add(values[1] as number);
            else if (sql.startsWith('DELETE'))
              votes.delete(values[1] as number);
            else if (sql.includes('INTO oauth_tokens'))
              tokenWrites.push(values);
          },
          all: async <T>() => {
            if (sql.includes('oauth_tokens'))
              return {
                results: (tokenRow
                  ? [{ access_token: 'org-access', ...tokenRow }]
                  : []) as T[],
              };
            if (sql.includes('ticket_tiers'))
              return { results: [{ budget: 3 }] as T[] };
            if (sql.includes('FROM talks')) return { results: talks as T[] };
            if (sql.includes('FROM c4p_votes'))
              return {
                results: [...votes].map((id) => ({ talk_id: id })) as T[],
              };
            return { results: [] as T[] };
          },
        }),
      }),
    },
  };
};

const makeEnv = (environment?: string): Env =>
  ({
    ENVIRONMENT: environment,
    GUILD_OAUTH_CLIENT_ID: 'cid',
    GUILD_OAUTH_CLIENT_SECRET: 'secret',
  }) as Env;

const getReq = (userId?: string): Request =>
  new Request('http://localhost/api/vote', {
    method: 'GET',
    headers: userId ? { 'X-Dev-User': userId } : {},
  });

const postReq = (
  body: unknown,
  init: { userId?: string; contentType?: string | null } = {}
): Request => {
  const headers: Record<string, string> = {};
  if (init.contentType !== null)
    headers['Content-Type'] = init.contentType ?? 'application/json';
  if (init.userId) headers['X-Dev-User'] = init.userId;
  return new Request('http://localhost/api/vote', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
};

describe('configs.vote', async () => {
  await it('isVotingOpen is true before the deadline, false after', () => {
    assert.equal(isVotingOpen(new Date('2026-01-01T00:00:00Z')), true);
    assert.equal(isVotingOpen(new Date('2099-01-01T00:00:00Z')), false);
  });
});

describe('helpers.session', async () => {
  await it('round-trips a signed session', async () => {
    const token = await signSession('user-1', 'secret');
    assert.equal(await verifySession(token, 'secret'), 'user-1');
  });

  await it('rejects a wrong secret and a tampered token', async () => {
    const token = await signSession('user-1', 'secret');
    assert.equal(await verifySession(token, 'other'), null);
    assert.equal(await verifySession(`${token}x`, 'secret'), null);
  });

  await it('rejects an expired session', async () => {
    const token = await signSession('user-1', 'secret', -1);
    assert.equal(await verifySession(token, 'secret'), null);
  });
});

describe('repositories.oauth-token', async () => {
  await it('returns the stored access token when still valid', async () => {
    const mock = makeMock();
    const token = await getOrgAccessToken(makeEnv(), mock.database);
    assert.equal(token, 'org-access');
    assert.equal(mock.tokenWrites.length, 0);
  });

  await it('refreshes and persists the rotated token when expired', async () => {
    const mock = makeMock([], { refresh_token: 'r1', expires_at: 0 });
    const token = await getOrgAccessToken(makeEnv(), mock.database);
    assert.equal(token, 'refreshed-access');
    assert.equal(mock.tokenWrites.length, 1);
    // [name, access_token, refresh_token, expires_at]
    assert.equal(mock.tokenWrites[0]?.[2], 'r2');
  });

  await it('seeds from the env refresh token when no row exists', async () => {
    const mock = makeMock([], null);
    const env = { ...makeEnv(), GUILD_ORG_REFRESH_TOKEN: 'seed' } as Env;
    const token = await getOrgAccessToken(env, mock.database);
    assert.equal(token, 'refreshed-access');
  });
});

describe('routes.voteGet', async () => {
  await it('returns 401 without a session', async () => {
    const res = await routes.voteGet({
      request: getReq(),
      cors,
      database: makeMock().database,
      env: makeEnv(),
    });
    assert.equal(res.status, 401);
  });

  await it('ignores the dev header in production (no bypass)', async () => {
    const res = await routes.voteGet({
      request: getReq('user-1'),
      cors,
      database: makeMock().database,
      env: makeEnv('production'),
    });
    assert.equal(res.status, 401);
  });

  await it('returns 403 for a non-attendee', async () => {
    const res = await routes.voteGet({
      request: getReq('ghost'),
      cors,
      database: makeMock().database,
      env: makeEnv(),
    });
    assert.equal(res.status, 403);
  });

  await it('returns budget, used, talks and current votes', async () => {
    const res = await routes.voteGet({
      request: getReq('user-1'),
      cors,
      database: makeMock([1]).database,
      env: makeEnv(),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      budget: number;
      used: number;
      talks: unknown[];
      myVotes: number[];
    };
    assert.equal(body.budget, 3);
    assert.equal(body.used, 1);
    assert.equal(body.talks.length, 2);
    assert.deepEqual(body.myVotes, [1]);
  });
});

describe('routes.voteSubmit', async () => {
  await it('records a vote', async () => {
    const mock = makeMock();
    const res = await routes.voteSubmit({
      request: postReq({ talkId: 2 }, { userId: 'user-1' }),
      cors,
      database: mock.database,
      env: makeEnv(),
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { success: true });
    assert.equal(mock.votes.has(2), true);
  });

  await it('rejects with 422 when budget is exhausted', async () => {
    const mock = makeMock([1, 2, 3]);
    const res = await routes.voteSubmit({
      request: postReq({ talkId: 4 }, { userId: 'user-1' }),
      cors,
      database: mock.database,
      env: makeEnv(),
    });
    assert.equal(res.status, 422);
    assert.deepEqual(await res.json(), { error: 'Vote limit reached.' });
    assert.equal(mock.votes.has(4), false);
  });

  await it('is idempotent when re-voting an existing talk at the limit', async () => {
    const mock = makeMock([1, 2, 3]);
    const res = await routes.voteSubmit({
      request: postReq({ talkId: 1 }, { userId: 'user-1' }),
      cors,
      database: mock.database,
      env: makeEnv(),
    });
    assert.equal(res.status, 200);
    assert.equal(mock.votes.size, 3);
  });

  await it('removes a vote', async () => {
    const mock = makeMock([1, 2]);
    const res = await routes.voteSubmit({
      request: postReq({ talkId: 1, action: 'remove' }, { userId: 'user-1' }),
      cors,
      database: mock.database,
      env: makeEnv(),
    });
    assert.equal(res.status, 200);
    assert.equal(mock.votes.has(1), false);
  });

  await it('returns 401 without a session', async () => {
    const res = await routes.voteSubmit({
      request: postReq({ talkId: 1 }),
      cors,
      database: makeMock().database,
      env: makeEnv(),
    });
    assert.equal(res.status, 401);
  });

  await it('returns 415 for non-JSON content type', async () => {
    const res = await routes.voteSubmit({
      request: postReq(
        { talkId: 1 },
        { userId: 'user-1', contentType: 'text/plain' }
      ),
      cors,
      database: makeMock().database,
      env: makeEnv(),
    });
    assert.equal(res.status, 415);
  });

  await it('returns 422 for an invalid body', async () => {
    const res = await routes.voteSubmit({
      request: postReq({ nope: true }, { userId: 'user-1' }),
      cors,
      database: makeMock().database,
      env: makeEnv(),
    });
    assert.equal(res.status, 422);
  });
});
