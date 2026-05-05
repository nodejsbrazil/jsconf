import { assert, describe, it } from 'poku';
import {
  createAuthHeader,
  makeDatabase,
  makeRequest,
  makeValidBody,
  route,
  seedSpeakerAndTalk,
} from './__utils__.js';

describe('routes.votingRetract', async () => {
  await describe('transport and schema', async () => {
    await it('returns 422 for missing talk_id on DELETE', async () => {
      const database = makeDatabase();
      await database
        .prepare(
          `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
        )
        .bind('user@example.com', 1, 5, '1234')
        .run();
      const authHeader = await createAuthHeader(1, 'user@example.com');
      const res = await route(
        makeRequest(
          {},
          {
            method: 'DELETE',
            headers: { Authorization: authHeader },
          }
        ),
        database
      );

      assert.equal(res.status, 422);
    });

    await it('returns 422 for missing talk_id on DELETE (no auth)', async () => {
      const database = makeDatabase();
      const res = await route(makeRequest({}, { method: 'DELETE' }), database);

      assert.equal(res.status, 401);
    });
  });

  await describe('business rules', async () => {
    await it('returns 401 when no auth header on DELETE', async () => {
      const database = makeDatabase();
      const res = await route(
        makeRequest(makeValidBody(), { method: 'DELETE' }),
        database
      );

      assert.equal(res.status, 401);
      assert.deepEqual(await res.json(), { error: 'unauthorized' });
    });

    await it('returns 404 when vote not found on DELETE', async () => {
      const database = makeDatabase();

      await database
        .prepare(
          `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
        )
        .bind('user@example.com', 1, 5, '1234')
        .run();

      const authHeader = await createAuthHeader(1, 'user@example.com');
      const res = await route(
        makeRequest(makeValidBody(), {
          method: 'DELETE',
          headers: { Authorization: authHeader },
        }),
        database
      );

      assert.equal(res.status, 404);
      assert.deepEqual(await res.json(), { error: 'Vote not found' });
    });
  });

  await describe('happy path', async () => {
    await it('retracts a vote and returns 200 with votes_remaining', async () => {
      const database = makeDatabase();
      await seedSpeakerAndTalk(database);

      await database
        .prepare(
          `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
        )
        .bind('user@example.com', 1, 5, '1234')
        .run();

      await database
        .prepare('INSERT INTO votes (user_id, talk_id) VALUES (?, ?)')
        .bind(1, 1)
        .run();

      const authHeader = await createAuthHeader(1, 'user@example.com');
      const res = await route(
        makeRequest(makeValidBody(), {
          method: 'DELETE',
          headers: { Authorization: authHeader },
        }),
        database
      );

      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { votes_remaining: 5 });

      const { results } = await database
        .prepare('SELECT * FROM votes WHERE user_id = ? AND talk_id = ?')
        .bind(1, 1)
        .all<unknown[]>();

      assert.equal(results.length, 0);
    });
  });
});
