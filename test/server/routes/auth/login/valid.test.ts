import { assert, describe, it } from 'poku';
import { VotingAuthResponseSchema } from '../../../../../src/server/schemas.js';
import { parseJsonResponse } from '../../../helpers.js';
import {
  makeDatabase,
  makeRequest,
  makeValidBody,
  route,
} from './__utils__.js';

describe('routes.login (valid input)', async () => {
  await it('returns 200 with user and tokens for an existing code', async () => {
    const database = makeDatabase();

    await database
      .prepare(
        `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
      )
      .bind('user@example.com', 1, 5, '1234')
      .run();

    const res = await route(makeRequest(makeValidBody()), database);

    assert.equal(res.status, 200);
    const json = await parseJsonResponse(
      Promise.resolve(res),
      VotingAuthResponseSchema
    );
    assert.equal(json.user.id, 1);
    assert.equal(json.user.email, 'user@example.com');
    assert.ok(json.access_token);
    assert.ok(json.refresh_token);
  });

  await it('returns tokens for a different user', async () => {
    const database = makeDatabase();

    await database
      .prepare(
        `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
      )
      .bind('user2@example.com', 1, 3, '5678')
      .run();

    const res = await route(
      makeRequest(makeValidBody({ code: '5678' })),
      database
    );

    assert.equal(res.status, 200);
    const json = await parseJsonResponse(
      Promise.resolve(res),
      VotingAuthResponseSchema
    );
    assert.equal(json.user.id, 1);
    assert.equal(json.user.email, 'user2@example.com');
    assert.ok(json.access_token);
    assert.ok(json.refresh_token);
  });
});
