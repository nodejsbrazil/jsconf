import type { Database } from '../../../src/server/types.js';
import { assert, describe, it } from 'poku';
import { managerAccessToken } from '../../../src/server/helpers/oauth.js';

// Regression test for a real production incident: the D1 row's refresh token was dead (guild had
// rotated it out from under this environment), and because managerAccessToken read D1 first, a
// freshly rotated GUILD_ORG_REFRESH_TOKEN secret was never reached. Recovery needed a manual row
// delete. The fallback below is what makes rotating the secret self-heal instead.
describe('helpers.oauth.managerAccessToken', async () => {
  const makeDb = (row: Record<string, unknown> | null) => {
    const writes: unknown[][] = [];
    const database: Database = {
      prepare: (sql: string) => ({
        bind: (...values: unknown[]) => ({
          run: async () => {
            if (sql.includes('INTO manager_oauth')) writes.push(values);
          },
          all: async <T>() => ({ results: (row ? [row] : []) as T[] }),
        }),
      }),
    };
    return { database, writes };
  };

  // Accepts only `good`; every other refresh token is refused the way guild refuses a spent one.
  const stubToken = (good: string): (() => string[]) => {
    const original = globalThis.fetch;
    const tried: string[] = [];
    globalThis.fetch = (async (_input: unknown, init?: RequestInit) => {
      const body = String(init?.body ?? '');
      const sent = new URLSearchParams(body).get('refresh_token') ?? '';
      tried.push(sent);
      if (sent !== good)
        return new Response(JSON.stringify({ error: 'invalid_grant' }), {
          status: 400,
        });
      return new Response(
        JSON.stringify({
          access_token: `access-for-${sent}`,
          refresh_token: `${sent}-rotated`,
          expires_in: 3600,
        }),
        { status: 200 }
      );
    }) as typeof fetch;
    return () => {
      globalThis.fetch = original;
      return tried;
    };
  };

  await it('uses the stored token when it still works', async () => {
    const { database, writes } = makeDb({
      refresh_token: 'stored',
      access_token: null,
      expires_at: 0,
    });
    const restore = stubToken('stored');
    const token = await managerAccessToken('id', 'secret', 'boot', database);
    const tried = restore();

    assert.equal(token, 'access-for-stored');
    assert.deepEqual(tried, ['stored']);
    // The rotated replacement is what gets persisted, never the one just spent.
    assert.equal(writes[0]?.[0], 'stored-rotated');
  });

  await it('falls back to the bootstrap secret when the stored token is dead', async () => {
    const { database, writes } = makeDb({
      refresh_token: 'dead',
      access_token: null,
      expires_at: 0,
    });
    const restore = stubToken('boot');
    const token = await managerAccessToken('id', 'secret', 'boot', database);
    const tried = restore();

    assert.equal(token, 'access-for-boot');
    assert.deepEqual(tried, ['dead', 'boot']);
    assert.equal(writes[0]?.[0], 'boot-rotated');
  });

  await it('does not retry when stored and bootstrap are the same value', async () => {
    const { database } = makeDb({
      refresh_token: 'same',
      access_token: null,
      expires_at: 0,
    });
    const restore = stubToken('nothing-works');
    const token = await managerAccessToken('id', 'secret', 'same', database);
    const tried = restore();

    assert.equal(token, null);
    assert.deepEqual(tried, ['same']);
  });

  await it('bootstraps from the secret when no row exists yet', async () => {
    const { database } = makeDb(null);
    const restore = stubToken('boot');
    const token = await managerAccessToken('id', 'secret', 'boot', database);
    const tried = restore();

    assert.equal(token, 'access-for-boot');
    assert.deepEqual(tried, ['boot']);
  });

  await it('serves the cached access token without any network call', async () => {
    const { database } = makeDb({
      refresh_token: 'stored',
      access_token: 'cached',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
    const restore = stubToken('never-called');
    const token = await managerAccessToken('id', 'secret', 'boot', database);
    const tried = restore();

    assert.equal(token, 'cached');
    assert.deepEqual(tried, []);
  });
});
