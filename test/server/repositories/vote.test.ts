import { assert, beforeEach, describe, it } from 'poku';
import { vote } from '../../../src/server/repositories/vote.js';
import { makeDatabase } from './__utils__.js';

describe('vote', () => {
  describe('schema validation', () => {
    const db = makeDatabase();
    const { schema } = vote(db);

    it('accepts valid data', () => {
      const result = schema.safeParse({ code: '1234', talk_id: 1 });
      assert.ok(result.success);
    });

    it('rejects non-4-char code (too short)', () => {
      const result = schema.safeParse({ code: '12', talk_id: 1 });
      assert.ok(!result.success);
    });

    it('rejects non-4-char code (too long)', () => {
      const result = schema.safeParse({ code: '12345', talk_id: 1 });
      assert.ok(!result.success);
    });

    it('rejects non-positive talk_id', () => {
      const result = schema.safeParse({ code: '1234', talk_id: 0 });
      assert.ok(!result.success);
    });

    it('rejects non-integer talk_id', () => {
      const result = schema.safeParse({ code: '1234', talk_id: 1.5 });
      assert.ok(!result.success);
    });
  });

  describe('repository methods', () => {
    let db: ReturnType<typeof makeDatabase>;

    beforeEach(() => {
      db = makeDatabase();
      // Set up required speaker + talk for vote tests
      db.prepare(
        'INSERT INTO speakers (name, email, phone, city, state, travel_pref, experience, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          'Speaker',
          'speaker@test.com',
          '11999999999',
          'São Paulo',
          'SP',
          0,
          1,
          'Test bio'
        )
        .run();
      db.prepare(
        'INSERT INTO talks (speaker_id, duration, title, description, audience_level, reason) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(1, 0, 'Test Talk', 'A test talk description', 1, 'Testing')
        .run();
      db.prepare(
        'INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)'
      )
        .bind('user@test.com', 1, 5, '1234')
        .run();
    });

    it('hasVoted returns false when no vote exists', async () => {
      const { hasVoted } = vote(db);
      const result = await hasVoted(999, 999);
      assert.equal(result, false);
    });

    it('cast inserts vote and hasVoted returns true', async () => {
      const { cast, hasVoted } = vote(db);
      await cast(1, 1);
      const result = await hasVoted(1, 1);
      assert.equal(result, true);
    });

    it('cast inserts vote for different user and talk', async () => {
      // Insert second user and talk
      db.prepare(
        'INSERT INTO speakers (name, email, phone, city, state, travel_pref, experience, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          'Speaker 2',
          'speaker2@test.com',
          '11999999999',
          'Rio',
          'RJ',
          0,
          1,
          'Test bio 2'
        )
        .run();
      db.prepare(
        'INSERT INTO talks (speaker_id, duration, title, description, audience_level, reason) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(2, 0, 'Test Talk 2', 'Another test talk', 1, 'Testing again')
        .run();
      db.prepare(
        'INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)'
      )
        .bind('user2@test.com', 1, 3, '5678')
        .run();

      const { cast, hasVoted } = vote(db);
      await cast(1, 2);
      assert.equal(await hasVoted(1, 2), true);
      assert.equal(await hasVoted(1, 1), false);
    });

    it('retract removes vote', async () => {
      const { cast, hasVoted, retract } = vote(db);
      await cast(1, 1);
      assert.equal(await hasVoted(1, 1), true);
      await retract(1, 1);
      assert.equal(await hasVoted(1, 1), false);
    });

    it('retract only removes specific user/talk combination', async () => {
      // Insert second user
      db.prepare(
        'INSERT INTO users (email, ticket_type, votes_allowed, code) VALUES (?, ?, ?, ?)'
      )
        .bind('user2@test.com', 1, 5, '5678')
        .run();
      db.prepare(
        'INSERT INTO talks (speaker_id, duration, title, description, audience_level, reason) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(1, 0, 'Second Talk', 'Another talk', 1, 'Testing')
        .run();

      const { cast, retract, hasVoted } = vote(db);
      await cast(1, 1);
      await cast(1, 2);
      await cast(2, 1);
      await retract(1, 1);
      assert.equal(await hasVoted(1, 1), false);
      assert.equal(await hasVoted(1, 2), true);
      assert.equal(await hasVoted(2, 1), true);
    });
  });
});
