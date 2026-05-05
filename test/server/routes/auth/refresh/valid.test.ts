import { assert, describe, it } from 'poku';
import {
  generateTokens,
  hashRefreshToken,
} from '../../../../../src/server/lib/tokens.js';
import { RefreshTokenResponseSchema } from '../../../../../src/server/routes/auth/refresh.js';
import { parseJsonResponse } from '../../../helpers.js';
import { makeDatabase, makeRequest, route } from './__utils__.js';

describe('routes.refresh (valid input)', async () => {
  const TEST_SECRET = 'test-secret-32-chars-minimum-here';

  await it('returns new tokens when refresh token is valid', async () => {
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
    const json = await parseJsonResponse(
      Promise.resolve(res),
      RefreshTokenResponseSchema
    );
    assert.ok(json.access_token);
    assert.ok(json.refresh_token);
    assert.notEqual(json.access_token, json.refresh_token);
  });

  await it('returned user has correct id and email', async () => {
    const db = makeDatabase();

    await db
      .prepare(
        `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
      )
      .bind('user2@example.com', 1, 3, '5678')
      .run();

    const tokens = await generateTokens(
      { id: 1, email: 'user2@example.com' },
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
    const json = await parseJsonResponse(
      Promise.resolve(res),
      RefreshTokenResponseSchema
    );
    assert.equal(json.user.id, 1);
    assert.equal(json.user.email, 'user2@example.com');
  });
});
