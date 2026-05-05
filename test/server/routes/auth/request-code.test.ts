import type { RouteContext } from '../../../../src/server/routes/types.js';
import type { Env } from '../../../../src/server/types.js';
import { assert, beforeEach, describe, it } from 'poku';
import { requestCode } from '../../../../src/server/routes/auth/request-code.js';
import { makeDatabase } from '../../repositories/__utils__.js';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Vary: 'Origin',
};

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/auth/request-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const noopSender = { sendCode: async () => {} };

const makeMockSender = () => {
  const calls: { email: string; code: string }[] = [];
  return {
    calls,
    sender: {
      sendCode: async (email: string, code: string) => {
        calls.push({ email, code });
      },
    },
  };
};

const mockEnv: Env = {
  DB: makeDatabase(),
  STRIPE_SECRET_KEY: 'test_key',
  STRIPE_WEBHOOK_SECRET: 'test_secret',
  ADMIN_KEY: 'test_admin',
  JWT_SECRET: 'test-secret-32-chars-minimum-here',
};

describe('requestCode', async () => {
  let db: ReturnType<typeof makeDatabase>;

  const seedUser = (email: string, code = '1234') => {
    db.prepare(
      'INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)'
    )
      .bind(email, 1, 3, code)
      .run();
  };

  beforeEach(() => {
    db = makeDatabase();
  });

  await it('returns 200 for valid email (code sent)', async () => {
    seedUser('user@example.com');
    const request = makeRequest({ email: 'user@example.com' });
    const ctx: RouteContext = {
      request,
      cors,
      database: db,
      env: mockEnv,
      sender: noopSender,
    };
    const res = await requestCode(ctx);
    assert.equal(res.status, 200);
  });

  await it('calls sender with correct email and code', async () => {
    seedUser('user@example.com', '9999');
    const request = makeRequest({ email: 'user@example.com' });
    const { sender, calls } = makeMockSender();
    const ctx: RouteContext = {
      request,
      cors,
      database: db,
      env: mockEnv,
      sender,
    };
    const res = await requestCode(ctx);
    assert.equal(res.status, 200);
    assert.equal(calls.length, 1);
    const call = calls[0]!;
    assert.equal(call.email, 'user@example.com');
    assert.equal(call.code, '9999');
  });

  await it('does not call sender when user not found', async () => {
    const request = makeRequest({ email: 'unknown@example.com' });
    const { sender, calls } = makeMockSender();
    const ctx: RouteContext = {
      request,
      cors,
      database: db,
      env: mockEnv,
      sender,
    };
    const res = await requestCode(ctx);
    assert.equal(res.status, 200);
    assert.equal(calls.length, 0);
  });

  await it('returns 200 even if user not found (no leak)', async () => {
    const request = makeRequest({ email: 'unknown@example.com' });
    const ctx: RouteContext = {
      request,
      cors,
      database: db,
      env: mockEnv,
      sender: noopSender,
    };
    const res = await requestCode(ctx);
    assert.equal(res.status, 200);
  });

  await it('returns 422 for invalid email format', async () => {
    const request = makeRequest({ email: 'not-an-email' });
    const ctx: RouteContext = {
      request,
      cors,
      database: db,
      env: mockEnv,
      sender: noopSender,
    };
    const res = await requestCode(ctx);
    assert.equal(res.status, 422);
  });

  await it('returns 422 for missing email', async () => {
    const request = makeRequest({});
    const ctx: RouteContext = {
      request,
      cors,
      database: db,
      env: mockEnv,
      sender: noopSender,
    };
    const res = await requestCode(ctx);
    assert.equal(res.status, 422);
  });

  await it('returns 415 for wrong content-type', async () => {
    const request = new Request('http://localhost/api/auth/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: '{ invalid }',
    });
    const ctx: RouteContext = {
      request,
      cors,
      database: db,
      env: mockEnv,
      sender: noopSender,
    };
    const res = await requestCode(ctx);
    assert.equal(res.status, 415);
  });

  await it('returns 400 for malformed JSON', async () => {
    const request = new Request('http://localhost/api/auth/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid',
    });
    const ctx: RouteContext = {
      request,
      cors,
      database: db,
      env: mockEnv,
      sender: noopSender,
    };
    const res = await requestCode(ctx);
    assert.equal(res.status, 400);
  });
});
