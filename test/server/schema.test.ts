import type { Database } from '../../src/server/types.js';
import { assert, describe, it } from 'poku';
import { user } from '../../src/server/repositories/user.js';
import { vote } from '../../src/server/repositories/vote.js';
import { waitlist } from '../../src/server/repositories/waitlist.js';

const stub = {
  prepare: () => ({
    bind: () => ({ run: async () => {}, all: async () => ({ results: [] }) }),
  }),
} as Database;
const { schema } = waitlist(stub);

describe('schema', () => {
  describe('email validation', () => {
    it('accepts a valid email', () => {
      const result = schema.safeParse({ email: 'user@example.com' });
      assert.ok(result.success);
    });

    it('rejects a missing email', () => {
      const result = schema.safeParse({});
      assert.ok(!result.success);
    });

    it('rejects an empty string', () => {
      const result = schema.safeParse({ email: '' });
      assert.ok(!result.success);
    });

    it('rejects an address without @', () => {
      const result = schema.safeParse({ email: 'not-an-email' });
      assert.ok(!result.success);
    });

    it('rejects an address without a domain', () => {
      const result = schema.safeParse({ email: 'user@' });
      assert.ok(!result.success);
    });

    it('rejects a non-string email value', () => {
      const result = schema.safeParse({ email: 42 });
      assert.ok(!result.success);
    });
  });

  describe('website (honeypot) field', () => {
    it('defaults to an empty string when absent', () => {
      const result = schema.safeParse({ email: 'user@example.com' });
      assert.ok(result.success);
      if (result.success) assert.equal(result.data.website, '');
    });

    it('accepts an empty string explicitly', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        website: '',
      });
      assert.ok(result.success);
    });

    it('accepts a non-empty string (bot detection handled in handler)', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        website: 'http://spam.io',
      });
      assert.ok(result.success);
      if (result.success) assert.equal(result.data.website, 'http://spam.io');
    });
  });

  describe('user schema', () => {
    const { schema: userSchema } = user(stub);

    it('accepts valid user data', () => {
      const result = userSchema.safeParse({
        email: 'user@example.com',
        ticket_type: 1,
        votes_allowed: 3,
        quantity: 1,
      });
      assert.ok(result.success);
    });

    it('rejects invalid email', () => {
      const result = userSchema.safeParse({
        email: 'invalid',
        ticket_type: 1,
        votes_allowed: 3,
        quantity: 1,
      });
      assert.ok(!result.success);
    });

    it('rejects negative ticket_type', () => {
      const result = userSchema.safeParse({
        email: 'user@example.com',
        ticket_type: -1,
        votes_allowed: 3,
        quantity: 1,
      });
      assert.ok(!result.success);
    });

    it('accepts zero ticket_type', () => {
      const result = userSchema.safeParse({
        email: 'user@example.com',
        ticket_type: 0,
        votes_allowed: 3,
        quantity: 1,
      });
      assert.ok(result.success);
    });

    it('rejects negative votes_allowed', () => {
      const result = userSchema.safeParse({
        email: 'user@example.com',
        ticket_type: 1,
        votes_allowed: -1,
        quantity: 1,
      });
      assert.ok(!result.success);
    });

    it('accepts zero votes_allowed', () => {
      const result = userSchema.safeParse({
        email: 'user@example.com',
        ticket_type: 1,
        votes_allowed: 0,
        quantity: 1,
      });
      assert.ok(result.success);
    });
  });

  describe('vote schema', () => {
    const { schema: voteSchema } = vote(stub);

    it('accepts valid vote data', () => {
      const result = voteSchema.safeParse({
        code: '1234',
        talk_id: 1,
      });
      assert.ok(result.success);
    });

    it('rejects non-4-char code', () => {
      const result = voteSchema.safeParse({
        code: '12',
        talk_id: 1,
      });
      assert.ok(!result.success);
    });

    it('rejects non-positive talk_id', () => {
      const result = voteSchema.safeParse({
        code: '1234',
        talk_id: 0,
      });
      assert.ok(!result.success);
    });
  });
});
