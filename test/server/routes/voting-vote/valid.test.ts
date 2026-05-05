import { assert, describe, it } from 'poku';
import {
  createAuthHeader,
  makeDatabase,
  makeRequest,
  makeValidBody,
  route,
  seedSpeakerAndTalk,
} from './__utils__.js';

describe('routes.votingVote (valid input)', async () => {
  await it('casts a vote and returns 200 with votes_remaining', async () => {
    const database = makeDatabase();
    await seedSpeakerAndTalk(database);

    await database
      .prepare(
        `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
      )
      .bind('user@example.com', 1, 5, '1234')
      .run();

    const authHeader = await createAuthHeader(1, 'user@example.com');
    const res = await route(
      makeRequest(makeValidBody(), {
        headers: { Authorization: authHeader },
      }),
      database
    );

    assert.equal(res.status, 200);
    const json = await res.json();

    assert.deepEqual(json, { votes_remaining: 4 });

    const { results } = await database
      .prepare(
        'SELECT user_id, talk_id FROM votes WHERE user_id = ? AND talk_id = ?'
      )
      .bind(1, 1)
      .all<{ user_id: number; talk_id: number }>();

    assert.equal(results.length, 1);
    assert.deepEqual(results[0], { user_id: 1, talk_id: 1 });
  });
});
