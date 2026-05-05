import type { Database, Env } from '../../../src/server/types.js';
import { assert, describe, it } from 'poku';
import { generateTokens } from '../../../src/server/lib/tokens.js';

describe('middleware.auth requireAuth', async () => {
  const TEST_SECRET = 'test-secret-32-chars-minimum-here';

  const mockEnv: Env = {
    DB: {} as Database,
    JWT_SECRET: TEST_SECRET,
    STRIPE_SECRET_KEY: 'test',
    STRIPE_WEBHOOK_SECRET: 'test',
    ADMIN_KEY: 'test',
  };

  await it('returns 401 when Authorization header is missing', async () => {
    const { requireAuth } =
      await import('../../../src/server/middleware/auth.js');
    const req = new Request('http://localhost/api/voting/vote', {
      method: 'POST',
    });
    const result = await requireAuth(req, mockEnv, {} as Database, {});
    assert.ok(result instanceof Response);
    const response = result as Response;
    assert.equal(response.status, 401);
    const json = (await response.json()) as { error: string };
    assert.equal(json.error, 'unauthorized');
  });

  await it('returns 401 when Authorization header is not Bearer', async () => {
    const { requireAuth } =
      await import('../../../src/server/middleware/auth.js');
    const req = new Request('http://localhost/api/voting/vote', {
      method: 'POST',
      headers: { Authorization: 'Basic abc123' },
    });
    const result = await requireAuth(req, mockEnv, {} as Database, {});
    assert.ok(result instanceof Response);
    const response = result as Response;
    assert.equal(response.status, 401);
    const json = (await response.json()) as { error: string };
    assert.equal(json.error, 'unauthorized');
  });

  await it('returns 401 when token is malformed', async () => {
    const { requireAuth } =
      await import('../../../src/server/middleware/auth.js');
    const req = new Request('http://localhost/api/voting/vote', {
      method: 'POST',
      headers: { Authorization: 'Bearer not-a-valid-jwt' },
    });
    const result = await requireAuth(req, mockEnv, {} as Database, {});
    assert.ok(result instanceof Response);
    const response = result as Response;
    assert.equal(response.status, 401);
    const json = (await response.json()) as { error: string };
    assert.equal(json.error, 'unauthorized');
  });

  await it('returns { user, request } when token is valid', async () => {
    const { requireAuth } =
      await import('../../../src/server/middleware/auth.js');
    const { access_token } = await generateTokens(
      { id: 42, email: 'user@test.com' },
      TEST_SECRET
    );

    const mockDb = {
      prepare: (sql: string) => ({
        bind: (...args: unknown[]) => ({
          all: async () => ({
            results: sql.includes('users')
              ? [
                  {
                    id: 42,
                    email: 'user@test.com',
                    ticket_type: 1,
                    votes_allowed: 5,
                  },
                ]
              : [],
          }),
        }),
      }),
    } as unknown as Database;

    const req = new Request('http://localhost/api/voting/vote', {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const result = await requireAuth(req, mockEnv, mockDb, {});
    assert.ok(!(result instanceof Response));
    const success = result as { user: { id: number }; request: Request };
    assert.equal(success.user.id, 42);
    assert.equal(success.request, req);
  });
});
