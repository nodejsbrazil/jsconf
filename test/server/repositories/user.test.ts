import { assert, beforeEach, describe, it } from 'poku';
import { user } from '../../../src/server/repositories/user.js';
import { makeDatabase } from './__utils__.js';

describe('user', () => {
  describe('schema validation', () => {
    const db = makeDatabase();
    const { schema } = user(db);

    it('accepts valid data', () => {
      const result = schema.safeParse({
        email: 'test@example.com',
        ticket_type: 1,
        votes_allowed: 3,
        quantity: 1,
      });
      assert.ok(result.success);
    });

    it('rejects invalid email', () => {
      const result = schema.safeParse({
        email: 'not-an-email',
        ticket_type: 1,
        votes_allowed: 3,
        quantity: 1,
      });
      assert.ok(!result.success);
    });

    it('rejects negative ticket_type', () => {
      const result = schema.safeParse({
        email: 'test@example.com',
        ticket_type: -1,
        votes_allowed: 3,
        quantity: 1,
      });
      assert.ok(!result.success);
    });

    it('accepts zero ticket_type', () => {
      const result = schema.safeParse({
        email: 'test@example.com',
        ticket_type: 0,
        votes_allowed: 3,
        quantity: 1,
      });
      assert.ok(result.success);
    });

    it('rejects ticket_type > 10', () => {
      const result = schema.safeParse({
        email: 'test@example.com',
        ticket_type: 11,
        votes_allowed: 3,
        quantity: 1,
      });
      assert.ok(!result.success);
    });

    it('rejects negative votes_allowed', () => {
      const result = schema.safeParse({
        email: 'test@example.com',
        ticket_type: 1,
        votes_allowed: -1,
        quantity: 1,
      });
      assert.ok(!result.success);
    });

    it('accepts zero votes_allowed', () => {
      const result = schema.safeParse({
        email: 'test@example.com',
        ticket_type: 1,
        votes_allowed: 0,
        quantity: 1,
      });
      assert.ok(result.success);
    });

    it('rejects votes_allowed > 100', () => {
      const result = schema.safeParse({
        email: 'test@example.com',
        ticket_type: 1,
        votes_allowed: 101,
        quantity: 1,
      });
      assert.ok(!result.success);
    });
  });

  describe('repository methods', () => {
    let db: ReturnType<typeof makeDatabase>;

    beforeEach(() => {
      db = makeDatabase();
    });

    it('findByCode returns user when found', async () => {
      const { insert, findByCode } = user(db);
      const code = await insert({
        email: 'test@example.com',
        ticket_type: 1,
        votes_allowed: 3,
        quantity: 1,
      });
      const result = await findByCode(code);
      assert.ok(result !== null);
      assert.deepEqual(
        {
          email: result?.email,
          ticket_type: result?.ticket_type,
          votes_allowed: result?.votes_allowed,
          quantity: result?.quantity,
          code: result?.code,
        },
        {
          email: 'test@example.com',
          ticket_type: 1,
          votes_allowed: 3,
          quantity: 1,
          code,
        }
      );
    });

    it('findByCode returns null when not found', async () => {
      const { findByCode } = user(db);
      const result = await findByCode('9999');
      assert.equal(result, null);
    });

    it('votesRemaining returns 0 for new user', async () => {
      const { insert, findByCode, votesRemaining } = user(db);
      const code = await insert({
        email: 'test@example.com',
        ticket_type: 1,
        votes_allowed: 3,
        quantity: 1,
      });
      const v = await findByCode(code);

      assert.ok(v?.id);
      const remaining = await votesRemaining(v?.id ?? -1);
      assert.equal(remaining, 0);
    });

    it('insert returns 4-digit code', async () => {
      const { insert } = user(db);
      const code = await insert({
        email: 'new@example.com',
        ticket_type: 1,
        votes_allowed: 3,
        quantity: 1,
      });
      assert.ok(typeof code === 'string');
      assert.equal(code.length, 4);
      assert.ok(/^\d{4}$/.test(code));
    });

    it('insertBatch returns codes for all items', async () => {
      const { insertBatch } = user(db);
      const results = await insertBatch([
        {
          email: 'user1@example.com',
          ticket_type: 1,
          votes_allowed: 3,
          quantity: 1,
        },
        {
          email: 'user2@example.com',
          ticket_type: 2,
          votes_allowed: 5,
          quantity: 1,
        },
      ]);
      assert.equal(results.length, 2);

      assert.equal(results[0]?.email, 'user1@example.com');
      assert.equal(results[1]?.email, 'user2@example.com');

      assert.ok(typeof results[0]?.code === 'string');
      assert.ok(typeof results[1]?.code === 'string');
    });

    it('insertBatch upserts on duplicate email', async () => {
      const { insertBatch, findByCode } = user(db);
      await insertBatch([
        {
          email: 'dup@example.com',
          ticket_type: 1,
          votes_allowed: 3,
          quantity: 1,
        },
      ]);

      const insertBatchResult = await insertBatch([
        {
          email: 'dup@example.com',
          ticket_type: 2,
          votes_allowed: 7,
          quantity: 2,
        },
      ]);

      assert.ok(insertBatchResult[0]?.code);
      const first = await findByCode(insertBatchResult[0]?.code ?? 'noop');

      assert.deepEqual(
        {
          ticket_type: first?.ticket_type,
          votes_allowed: first?.votes_allowed,
          quantity: first?.quantity,
        },
        { ticket_type: 2, votes_allowed: 10, quantity: 3 }
      );
    });

    it('findByCode with code from insertBatch works', async () => {
      const { insertBatch, findByCode } = user(db);
      const results = await insertBatch([
        {
          email: 'batch@example.com',
          ticket_type: 1,
          votes_allowed: 3,
          quantity: 1,
        },
      ]);

      const code = results[0]?.code;
      assert.ok(code);

      const found = await findByCode(code ?? 'noop');

      assert.ok(found !== null);
      assert.deepEqual({ email: found?.email }, { email: 'batch@example.com' });
    });

    it('getEligibleTalks returns talks with all fields', async () => {
      db.prepare(
        `
        INSERT INTO speakers (name, email, phone, city, state, travel_pref, experience, bio)
        VALUES ('Speaker Name', 'spk@test.com', '11999999999', 'São Paulo', 'SP', 0, 1, 'Bio here')
      `
      )
        .bind()
        .run();

      db.prepare(
        `
        INSERT INTO talks (speaker_id, duration, title, description, audience_level, reason, status)
        VALUES (1, 0, 'Test Talk', 'This is a great talk about stuff', 1, 'Because', 2)
      `
      )
        .bind()
        .run();

      const { getEligibleTalks } = user(db);
      const talks = await getEligibleTalks();

      assert.ok(talks.length > 0);
      const first = talks[0]!;
      assert.equal(first.title, 'Test Talk');
      assert.equal(first.description, 'This is a great talk about stuff');
      assert.equal(first.speaker_name, 'Speaker Name');
      assert.equal(first.duration, 0);
      assert.equal(first.audience_level, 1);
    });
  });

  describe('code generation uniqueness', () => {
    let db: ReturnType<typeof makeDatabase>;

    beforeEach(() => {
      db = makeDatabase();
    });

    it('insert generates a 4-digit code', async () => {
      const { insert } = user(db);
      const code = await insert({
        email: 'test@test.com',
        ticket_type: 1,
        votes_allowed: 3,
        quantity: 1,
      });
      assert.ok(typeof code === 'string');
      assert.equal(code.length, 4);
      assert.ok(/^\d{4}$/.test(code));
    });

    it('insertBatch generates unique codes for each user', async () => {
      const { insertBatch } = user(db);
      const results = await insertBatch([
        { email: 'a@test.com', ticket_type: 1, votes_allowed: 1, quantity: 1 },
        { email: 'b@test.com', ticket_type: 1, votes_allowed: 1, quantity: 1 },
        { email: 'c@test.com', ticket_type: 1, votes_allowed: 1, quantity: 1 },
      ]);
      const codes = results.map((r) => r.code);
      assert.equal(codes.length, 3);
      const unique = new Set(codes);
      assert.equal(unique.size, 3);
      for (const c of codes) {
        assert.equal(c.length, 4);
        assert.ok(/^\d{4}$/.test(c));
      }
    });

    it('generateCode produces values in range 1000-9999', async () => {
      const { insert } = user(db);
      for (let i = 0; i < 20; i++) {
        const code = await insert({
          email: `gen${i}@test.com`,
          ticket_type: 1,
          votes_allowed: 1,
          quantity: 1,
        });
        const n = parseInt(code, 10);
        assert.ok(n >= 1000 && n <= 9999, `code ${code} out of range`);
      }
    });
  });
});
