import type { Env } from '../handler.js';
import { assert, beforeEach, describe, it } from 'poku';
import { handleWaitlist } from '../handler.js';

const ORIGIN = 'https://example.com';
const URL_BASE = 'https://worker.example.com';

type MockDB = Env['DB'] & {
  _lastInsertedEmail: string | null;
  _lastInsertedUtmSource: string | null | undefined;
  _throwOnInsert: Error | null;
};

const makeMockDB = (opts: { throwOnInsert?: Error } = {}): MockDB => {
  const db: MockDB = {
    _lastInsertedEmail: null,
    _lastInsertedUtmSource: undefined,
    _throwOnInsert: opts.throwOnInsert ?? null,
    prepare(_sql: string) {
      return {
        bind(...values: unknown[]) {
          return {
            run: async () => {
              if (db._throwOnInsert) throw db._throwOnInsert;
              db._lastInsertedEmail = values[0] as string;
              db._lastInsertedUtmSource = values[1] as string | null;
            },
          };
        },
      };
    },
  };
  return db;
};

const makeEnv = (db: MockDB, allowedOrigin?: string): Env =>
  ({ DB: db, ALLOWED_ORIGIN: allowedOrigin }) as unknown as Env;

const post = (body: unknown, db: MockDB): Promise<Response> => {
  const req = new Request(`${URL_BASE}/api/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify(body),
  });
  return handleWaitlist(req, makeEnv(db));
};

await describe('handleWaitlist — CORS', async () => {
  await it('responds to OPTIONS preflight with 204 and CORS headers', async () => {
    const db = makeMockDB();
    const req = new Request(`${URL_BASE}/api/waitlist`, {
      method: 'OPTIONS',
      headers: { Origin: ORIGIN },
    });
    const res = await handleWaitlist(req, makeEnv(db));
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  });

  await it('attaches the CORS origin header on all non-preflight responses', async () => {
    const db = makeMockDB();
    const res = await post({ email: 'a@b.com', website: '' }, db);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  });

  await it('uses ALLOWED_ORIGIN when set', async () => {
    const db = makeMockDB();
    const req = new Request(`${URL_BASE}/api/waitlist`, {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:3000' },
    });
    const res = await handleWaitlist(
      req,
      makeEnv(db, 'https://production.com')
    );
    assert.equal(
      res.headers.get('Access-Control-Allow-Origin'),
      'https://production.com'
    );
  });
});

await describe('handleWaitlist — routing', async () => {
  await it('returns 404 for an unknown path', async () => {
    const db = makeMockDB();
    const req = new Request(`${URL_BASE}/unknown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
      body: JSON.stringify({ email: 'a@b.com' }),
    });
    const res = await handleWaitlist(req, makeEnv(db));
    assert.equal(res.status, 404);
  });

  await it('returns 404 for a GET request to the correct path', async () => {
    const db = makeMockDB();
    const req = new Request(`${URL_BASE}/api/waitlist`, {
      method: 'GET',
      headers: { Origin: ORIGIN },
    });
    const res = await handleWaitlist(req, makeEnv(db));
    assert.equal(res.status, 404);
  });
});

await describe('handleWaitlist — input validation', async () => {
  await it('returns 400 for non-JSON body', async () => {
    const db = makeMockDB();
    const req = new Request(`${URL_BASE}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
      body: 'not json{{{',
    });
    const res = await handleWaitlist(req, makeEnv(db));
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'invalid_json' });
  });

  await it('returns 422 for a missing email', async () => {
    const db = makeMockDB();
    const res = await post({}, db);
    assert.equal(res.status, 422);
    assert.deepEqual(await res.json(), { error: 'invalid_input' });
  });

  await it('returns 422 for an invalid email format', async () => {
    const db = makeMockDB();
    const res = await post({ email: 'not-an-email', website: '' }, db);
    assert.equal(res.status, 422);
  });

  await it('returns 422 for an empty email', async () => {
    const db = makeMockDB();
    const res = await post({ email: '', website: '' }, db);
    assert.equal(res.status, 422);
  });
});

await describe('handleWaitlist — honeypot', async () => {
  await it('silently returns 201 when the honeypot field is filled', async () => {
    const db = makeMockDB();
    const res = await post(
      { email: 'bot@evil.com', website: 'http://spam.io' },
      db
    );
    assert.equal(res.status, 201);
    assert.deepEqual(await res.json(), { success: true });
    assert.equal(db._lastInsertedEmail, null);
  });
});

await describe('handleWaitlist — happy path', async () => {
  let db: MockDB;
  beforeEach(() => {
    db = makeMockDB();
  });

  await it('inserts the email and returns 201', async () => {
    const res = await post({ email: 'hello@example.com', website: '' }, db);
    assert.equal(res.status, 201);
    assert.deepEqual(await res.json(), { success: true });
    assert.equal(db._lastInsertedEmail, 'hello@example.com');
  });

  await it('stores utm_source when provided', async () => {
    const res = await post(
      { email: 'utm@example.com', website: '', utmSource: 'twitter' },
      db
    );
    assert.equal(res.status, 201);
    assert.equal(db._lastInsertedUtmSource, 'twitter');
  });

  await it('stores null for utm_source when omitted', async () => {
    const res = await post({ email: 'noUtm@example.com', website: '' }, db);
    assert.equal(res.status, 201);
    assert.equal(db._lastInsertedUtmSource, null);
  });

  await it('returns 201 on duplicate without leaking registration status', async () => {
    const err = new Error('D1_ERROR: UNIQUE constraint failed: waitlist.email');
    const dupDB = makeMockDB({ throwOnInsert: err });
    const res = await post(
      { email: 'existing@example.com', website: '' },
      dupDB
    );
    assert.equal(res.status, 201);
    assert.deepEqual(await res.json(), { success: true });
  });
});
