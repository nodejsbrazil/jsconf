import type { Database, Env } from '../../../src/server/types.js';
import { assert, describe, it } from 'poku';
import { isVotingOpen } from '../../../src/server/configs/vote.js';
import {
  signSession,
  verifySession,
} from '../../../src/server/helpers/session.js';
import { vote } from '../../../src/server/repositories/vote.js';
import { routes } from '../../../src/server/routes.js';

const cors = { 'Access-Control-Allow-Origin': '*' };

const talks = [
  { id: 1, title: 'A', description: 'da' },
  { id: 2, title: 'B', description: 'db' },
];

type Mock = { database: Database; votes: Set<number> };

const makeMock = (seed: number[] = []): Mock => {
  const votes = new Set<number>(seed);
  return {
    votes,
    database: {
      prepare: (sql: string) => ({
        bind: (...values: unknown[]) => ({
          run: async () => {
            if (sql.includes('INTO c4p_votes')) votes.add(values[1] as number);
            else if (sql.startsWith('DELETE'))
              votes.delete(values[1] as number);
          },
          all: async <T>() => {
            if (sql.includes('ticket_tiers'))
              return { results: [{ budget: 3 }] as T[] };
            // castVote's votable-talk guard: ids 1-4 exist and are votable.
            if (sql.startsWith('SELECT 1 FROM talks'))
              return {
                results: ((values[0] as number) <= 4 ? [{ 1: 1 }] : []) as T[],
              };
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

// Default to 'development' so the X-Dev-User bypass (fail closed, honored only when ENVIRONMENT is
// exactly 'development') is active for tests that exercise it.
const makeEnv = (environment: string = 'development'): Env =>
  ({ ENVIRONMENT: environment }) as Env;

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
  await it('round-trips a signed session carrying the budget', async () => {
    const token = await signSession('user-1', 5, 'secret');
    assert.deepEqual(await verifySession(token, 'secret'), {
      userId: 'user-1',
      budget: 5,
    });
  });

  await it('rejects a wrong secret and a tampered token', async () => {
    const token = await signSession('user-1', 5, 'secret');
    assert.equal(await verifySession(token, 'other'), null);
    assert.equal(await verifySession(`${token}x`, 'secret'), null);
  });

  await it('rejects an expired session', async () => {
    const token = await signSession('user-1', 5, 'secret', -1);
    assert.equal(await verifySession(token, 'secret'), null);
  });
});

describe('repositories.vote.budgetForTier', async () => {
  await it('returns the tier budget from ticket_tiers', async () => {
    const budget = await vote(makeMock().database).budgetForTier('Standard');
    assert.equal(budget, 3);
  });

  await it('defaults to 1 for a tier not in the overrides table', async () => {
    const db: Database = {
      prepare: () => ({
        bind: () => ({
          run: async () => {},
          all: async <T>() => ({ results: [] as T[] }),
        }),
      }),
    };
    assert.equal(await vote(db).budgetForTier('Nope'), 1);
  });
});

describe('routes.authMe', async () => {
  // 200 rather than 401 on purpose: this runs on every page load, and a 401 puts a failed
  // request in every anonymous visitor's console.
  await it('reports anonymous as 200 without a session', async () => {
    const res = await routes.authMe({
      request: new Request('http://localhost/api/vote/me'),
      cors,
      env: makeEnv(),
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { authenticated: false });
  });

  await it('returns the user id from the session (dev header)', async () => {
    const res = await routes.authMe({
      request: new Request('http://localhost/api/vote/me', {
        headers: { 'X-Dev-User': 'user-1' },
      }),
      cors,
      env: makeEnv(),
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      authenticated: true,
      userId: 'user-1',
    });
  });
});

describe('routes.authLogout', async () => {
  await it('redirects and clears the session cookie', async () => {
    const res = await routes.authLogout({
      request: new Request('http://localhost/api/vote/logout'),
      env: { ALLOWED_ORIGIN: 'http://site' } as Env,
    });
    assert.equal(res.status, 302);
    assert.equal(res.headers.get('Location'), 'http://site/vote');
    const cookie = res.headers.get('Set-Cookie') ?? '';
    assert.equal(cookie.includes('vote_session=;'), true);
    assert.equal(cookie.includes('Max-Age=0'), true);
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

  await it('ignores the dev header when ENVIRONMENT is unset (fail closed)', async () => {
    const res = await routes.voteGet({
      request: getReq('user-1'),
      cors,
      database: makeMock().database,
      env: {} as Env,
    });
    assert.equal(res.status, 401);
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

  await it('rejects with 422 a talk that is not votable', async () => {
    const mock = makeMock();
    const res = await routes.voteSubmit({
      request: postReq({ talkId: 99 }, { userId: 'user-1' }),
      cors,
      database: mock.database,
      env: makeEnv(),
    });
    assert.equal(res.status, 422);
    assert.deepEqual(await res.json(), { error: 'Invalid talk.' });
    assert.equal(mock.votes.has(99), false);
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
