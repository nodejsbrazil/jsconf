import { assert, describe, it } from 'poku';
import {
  generateTokens,
  hashRefreshToken,
} from '../../../../../src/server/lib/tokens.js';
import { makeDatabase, makeRequest, route } from './__utils__.js';

describe('routes.logout (valid input)', async () => {
  const TEST_SECRET = 'test-secret-32-chars-minimum-here';

  await it('returns success true and clears refresh token', async () => {
    const db = makeDatabase();

    // Seed user
    await db
      .prepare(
        `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
      )
      .bind('user@example.com', 1, 5, '1234')
      .run();

    // Generate tokens and store hash in DB
    const tokens = await generateTokens(
      { id: 1, email: 'user@example.com' },
      TEST_SECRET
    );
    const hash = hashRefreshToken(tokens.refresh_token);
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    await db
      .prepare(
        'UPDATE users SET refresh_token_hash = ?, refresh_token_expires_at = ? WHERE id = ?'
      )
      .bind(hash, expiresAt, 1)
      .run();

    const res = await route(
      makeRequest({ refresh_token: tokens.refresh_token }),
      db
    );

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.deepEqual(json, { success: true });

    // Verify token was cleared
    const { results } = await db
      .prepare('SELECT refresh_token_hash FROM users WHERE id = ?')
      .bind(1)
      .all<{ refresh_token_hash: string | null }>();
    assert.equal(results[0]?.refresh_token_hash, null);
  });
});
