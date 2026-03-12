import type { Database } from '../../src/server/types.js';
import { assert, describe, it } from 'poku';
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
});
