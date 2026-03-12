import { assert, describe, it } from 'poku';
import { BodySchema } from '../../src/server/schema';

describe('BodySchema', () => {
  describe('email validation', () => {
    it('accepts a valid email', () => {
      const result = BodySchema.safeParse({ email: 'user@example.com' });
      assert.ok(result.success);
    });

    it('rejects a missing email', () => {
      const result = BodySchema.safeParse({});
      assert.ok(!result.success);
    });

    it('rejects an empty string', () => {
      const result = BodySchema.safeParse({ email: '' });
      assert.ok(!result.success);
    });

    it('rejects an address without @', () => {
      const result = BodySchema.safeParse({ email: 'not-an-email' });
      assert.ok(!result.success);
    });

    it('rejects an address without a domain', () => {
      const result = BodySchema.safeParse({ email: 'user@' });
      assert.ok(!result.success);
    });

    it('rejects a non-string email value', () => {
      const result = BodySchema.safeParse({ email: 42 });
      assert.ok(!result.success);
    });
  });

  describe('website (honeypot) field', () => {
    it('defaults to an empty string when absent', () => {
      const result = BodySchema.safeParse({ email: 'user@example.com' });
      assert.ok(result.success);
      if (result.success) assert.equal(result.data.website, '');
    });

    it('accepts an empty string explicitly', () => {
      const result = BodySchema.safeParse({
        email: 'user@example.com',
        website: '',
      });
      assert.ok(result.success);
    });

    it('accepts a non-empty string (bot detection handled in handler)', () => {
      const result = BodySchema.safeParse({
        email: 'user@example.com',
        website: 'http://spam.io',
      });
      assert.ok(result.success);
      if (result.success) assert.equal(result.data.website, 'http://spam.io');
    });
  });
});
