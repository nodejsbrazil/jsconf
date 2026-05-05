import { assert, describe, it } from 'poku';
import {
  createAuthHeader,
  makeDatabase,
  makeRequest,
  makeValidBody,
  route,
  seedSpeakerAndTalk,
} from './__utils__.js';

describe('routes.votingVote (invalid input)', async () => {
  await describe('transport guards', async () => {
    await it('returns 415 for a non-JSON content type', async () => {
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
          headers: {
            'Content-Type': 'text/plain',
            Authorization: authHeader,
          },
        }),
        database
      );

      assert.equal(res.status, 415);
    });

    await it('returns 400 for malformed JSON', async () => {
      const database = makeDatabase();
      await database
        .prepare(
          `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
        )
        .bind('user@example.com', 1, 5, '1234')
        .run();
      const authHeader = await createAuthHeader(1, 'user@example.com');
      const res = await route(
        makeRequest(null, {
          raw: '{not json',
          headers: { Authorization: authHeader },
        }),
        database
      );

      assert.equal(res.status, 400);
      assert.deepEqual(await res.json(), { error: 'Invalid JSON.' });
    });
  });

  await describe('schema rejections', async () => {
    await it('returns 422 for missing talk_id field', async () => {
      const database = makeDatabase();
      await database
        .prepare(
          `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
        )
        .bind('user@example.com', 1, 5, '1234')
        .run();
      const authHeader = await createAuthHeader(1, 'user@example.com');
      const res = await route(
        makeRequest({}, { headers: { Authorization: authHeader } }),
        database
      );

      assert.equal(res.status, 422);
    });

    await it('returns 422 when talk_id is not positive', async () => {
      const database = makeDatabase();
      await database
        .prepare(
          `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
        )
        .bind('user@example.com', 1, 5, '1234')
        .run();
      const authHeader = await createAuthHeader(1, 'user@example.com');
      const res = await route(
        makeRequest({ talk_id: 0 }, { headers: { Authorization: authHeader } }),
        database
      );

      assert.equal(res.status, 422);
    });
  });

  await describe('business rules', async () => {
    await it('returns 401 when Authorization header is missing', async () => {
      const database = makeDatabase();
      const res = await route(makeRequest({ talk_id: 1 }), database);

      assert.equal(res.status, 401);
      assert.deepEqual(await res.json(), { error: 'unauthorized' });
    });

    await it('returns 409 when already voted for this talk', async () => {
      const database = makeDatabase();
      await seedSpeakerAndTalk(database);

      // Seed user
      await database
        .prepare(
          `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
        )
        .bind('user@example.com', 1, 5, '1234')
        .run();

      // Seed vote
      await database
        .prepare(`INSERT INTO votes (user_id, talk_id) VALUES (?, ?)`)
        .bind(1, 1)
        .run();

      const authHeader = await createAuthHeader(1, 'user@example.com');
      const res = await route(
        makeRequest(makeValidBody(), {
          headers: { Authorization: authHeader },
        }),
        database
      );

      assert.equal(res.status, 409);
      assert.deepEqual(await res.json(), {
        error: 'Already voted for this talk',
      });
    });

    await it('returns 403 when no votes remaining', async () => {
      const database = makeDatabase();
      await seedSpeakerAndTalk(database);

      // Seed user with 1 vote allowed and cast it
      await database
        .prepare(
          `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
        )
        .bind('user@example.com', 1, 1, '1234')
        .run();

      await database
        .prepare(`INSERT INTO votes (user_id, talk_id) VALUES (?, ?)`)
        .bind(1, 1)
        .run();

      const authHeader = await createAuthHeader(1, 'user@example.com');
      const res = await route(
        makeRequest(makeValidBody(), {
          headers: { Authorization: authHeader },
        }),
        database
      );

      assert.equal(res.status, 403);
      assert.deepEqual(await res.json(), { error: 'No votes remaining' });
    });
  });
});
