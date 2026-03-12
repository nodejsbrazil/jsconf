import type { Database } from '../../../src/server/types.js';
import { assert, beforeEach, describe, it } from 'poku';
import { routes } from '../../../src/server/routes.js';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Vary: 'Origin',
};

type MockDatabase = {
  database: Database;
  lastInsertedEmail: string | null;
  lastInsertedUtmSource: string | null | undefined;
  lastInsertedIpHash: string | null;
  ipCount: number;
};

const makeMockDatabase = (
  opts: { throwOnRun?: Error; ipCount?: number } = {}
): MockDatabase => {
  const mock: MockDatabase = {
    lastInsertedEmail: null,
    lastInsertedUtmSource: undefined,
    lastInsertedIpHash: null,
    ipCount: opts.ipCount ?? 0,
    database: {
      prepare: () => ({
        bind: (...values: unknown[]) => ({
          run: async () => {
            if (opts.throwOnRun) throw opts.throwOnRun;
            mock.lastInsertedEmail = values[0] as string;
            mock.lastInsertedIpHash = values[1] as string;
            mock.lastInsertedUtmSource = (values[2] as string | null) ?? null;
          },
          all: async <T>() => ({ results: [{ total: mock.ipCount }] as T[] }),
        }),
      }),
    },
  };
  return mock;
};

const makeRequest = (body: unknown): Request =>
  new Request('http://localhost/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const post = async (
  body: unknown,
  mock: MockDatabase,
  ip = 'abc123'
): Promise<Response> =>
  routes.waitlist({
    request: makeRequest(body),
    cors,
    database: mock.database,
    ip,
  });

describe('routes.waitlist', async () => {
  await describe('input validation', async () => {
    await it('returns 422 for a missing email', async () => {
      const mock = makeMockDatabase();
      const res = await post({}, mock);
      assert.equal(res.status, 422);
      assert.deepEqual(await res.json(), { error: 'Invalid input.' });
    });

    await it('returns 422 for an invalid email format', async () => {
      const mock = makeMockDatabase();
      const res = await post({ email: 'not-an-email', website: '' }, mock);
      assert.equal(res.status, 422);
    });

    await it('returns 422 for an empty email', async () => {
      const mock = makeMockDatabase();
      const res = await post({ email: '', website: '' }, mock);
      assert.equal(res.status, 422);
    });
  });

  await describe('honeypot', async () => {
    await it('silently returns 201 when the honeypot field is filled', async () => {
      const mock = makeMockDatabase();
      const res = await post(
        { email: 'bot@evil.com', website: 'http://spam.io' },
        mock
      );

      assert.equal(res.status, 201);
      assert.deepEqual(await res.json(), { success: true });
      assert.equal(mock.lastInsertedEmail, null);
    });
  });

  await describe('happy path', async () => {
    let mock: MockDatabase;
    beforeEach(() => {
      mock = makeMockDatabase();
    });

    await it('inserts the email and returns 201', async () => {
      const res = await post({ email: 'hello@example.com', website: '' }, mock);

      assert.equal(res.status, 201);
      assert.deepEqual(await res.json(), { success: true });
      assert.equal(mock.lastInsertedEmail, 'hello@example.com');
    });

    await it('stores utm_source when provided', async () => {
      const res = await post(
        { email: 'utm@example.com', website: '', utmSource: 'twitter' },
        mock
      );

      assert.equal(res.status, 201);
      assert.equal(mock.lastInsertedUtmSource, 'twitter');
    });

    await it('stores null for utm_source when omitted', async () => {
      const res = await post({ email: 'noUtm@example.com', website: '' }, mock);

      assert.equal(res.status, 201);
      assert.equal(mock.lastInsertedUtmSource, null);
    });

    await it('returns 201 on duplicate without leaking registration status', async () => {
      const dupMock = makeMockDatabase({
        throwOnRun: new Error(
          'D1_ERROR: UNIQUE constraint failed: waitlist.email'
        ),
      });
      const res = await post(
        { email: 'existing@example.com', website: '' },
        dupMock
      );

      assert.equal(res.status, 201);
      assert.deepEqual(await res.json(), { success: true });
    });
  });
});
