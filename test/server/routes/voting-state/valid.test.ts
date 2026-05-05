import { assert, describe, it } from 'poku';
import { generateTokens } from '../../../../src/server/lib/tokens.js';
import { VotingStateResponseSchema } from '../../../../src/server/routes/voting-state.js';
import { parseJsonResponse } from '../../helpers.js';
import { makeDatabase, makeRequest, route } from './__utils__.js';

const TEST_SECRET = 'test-secret-32-chars-minimum-here';

describe('routes.votingState (valid input)', async () => {
  const seedData = async (db: ReturnType<typeof makeDatabase>) => {
    await db
      .prepare(
        `INSERT INTO speakers (name, email, phone, city, state, travel_pref, experience, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        'Alice',
        'alice@example.com',
        '11999999999',
        'São Paulo',
        'SP',
        0,
        2,
        'Bio'
      )
      .run();

    await db
      .prepare(
        `INSERT INTO talks (speaker_id, duration, title, description, audience_level, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(1, 0, 'Talk Title', 'Description', 1, 'Reason', 2)
      .run();

    await db
      .prepare(
        `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
      )
      .bind('user@example.com', 1, 5, '1234')
      .run();
  };

  await it('returns 200 with talks and votedTalkIds when user is authenticated and has voted', async () => {
    const database = makeDatabase();
    await seedData(database);

    // Cast a vote
    await database
      .prepare('INSERT INTO votes (user_id, talk_id) VALUES (?, ?)')
      .bind(1, 1)
      .run();

    const tokens = await generateTokens(
      { id: 1, email: 'user@example.com' },
      TEST_SECRET
    );
    const res = await route(
      makeRequest({
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }),
      database
    );

    assert.equal(res.status, 200);
    const json = await parseJsonResponse(
      Promise.resolve(res),
      VotingStateResponseSchema
    );
    assert.equal(json.user.id, 1);
    assert.equal(json.user.email, 'user@example.com');
    assert.equal(json.user.votes_remaining, 4);
    assert.equal(json.talks.length, 1);
    assert.equal(json.talks[0]!.id, 1);
    assert.equal(json.talks[0]!.title, 'Talk Title');
    assert.deepEqual(json.votedTalkIds, [1]);
  });

  await it('returns empty votedTalkIds when user has not voted yet', async () => {
    const database = makeDatabase();
    await seedData(database);

    const tokens = await generateTokens(
      { id: 1, email: 'user@example.com' },
      TEST_SECRET
    );
    const res = await route(
      makeRequest({
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }),
      database
    );

    assert.equal(res.status, 200);
    const json = await parseJsonResponse(
      Promise.resolve(res),
      VotingStateResponseSchema
    );
    assert.equal(json.user.votes_remaining, 5);
    assert.equal(json.talks.length, 1);
    assert.deepEqual(json.votedTalkIds, []);
  });

  await it('returns correct votes_remaining in user object', async () => {
    const database = makeDatabase();

    await database
      .prepare(
        `INSERT INTO speakers (name, email, phone, city, state, travel_pref, experience, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind('Bob', 'bob@example.com', '11999998888', 'Rio', 'RJ', 0, 1, 'Bio')
      .run();

    await database
      .prepare(
        `INSERT INTO talks (speaker_id, duration, title, description, audience_level, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(1, 0, 'Another Talk', 'Desc', 1, 'Reason', 2)
      .run();

    await database
      .prepare(
        `INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)`
      )
      .bind('user2@example.com', 1, 3, '5678')
      .run();

    const tokens = await generateTokens(
      { id: 1, email: 'user2@example.com' },
      TEST_SECRET
    );
    const res = await route(
      makeRequest({
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }),
      database
    );

    assert.equal(res.status, 200);
    const json = await parseJsonResponse(
      Promise.resolve(res),
      VotingStateResponseSchema
    );
    assert.equal(json.user.id, 1);
    assert.equal(json.user.email, 'user2@example.com');
    assert.equal(json.user.votes_remaining, 3);
  });
});
