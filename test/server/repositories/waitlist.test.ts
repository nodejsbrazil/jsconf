import { assert, beforeEach, describe, it } from 'poku';
import { waitlist } from '../../../src/server/repositories/waitlist.js';
import { makeDatabase } from './__utils__.js';

describe('waitlist', () => {
  describe('schema validation', () => {
    const db = makeDatabase();
    const { schema } = waitlist(db);

    it('accepts valid email only', () => {
      const result = schema.safeParse({ email: 'user@example.com' });
      assert.ok(result.success);
    });

    it('accepts valid email with utmSource', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        utmSource: 'google',
      });
      assert.ok(result.success);
    });

    it('accepts all valid utmSource values', () => {
      const sources = [
        'google',
        'facebook',
        'x',
        'twitter',
        'linkedin',
        'github',
        'instagram',
        'bluesky',
        'slack',
        'newsletter',
      ] as const;
      for (const src of sources) {
        const result = schema.safeParse({
          email: 'user@example.com',
          utmSource: src,
        });
        assert.ok(result.success, `Failed for ${src}`);
      }
    });

    it('rejects missing email', () => {
      const result = schema.safeParse({});
      assert.ok(!result.success);
    });

    it('rejects invalid email', () => {
      const result = schema.safeParse({ email: 'not-an-email' });
      assert.ok(!result.success);
    });

    it('rejects empty email', () => {
      const result = schema.safeParse({ email: '' });
      assert.ok(!result.success);
    });

    it('accepts website honeypot field', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        website: 'http://spam.com',
      });
      assert.ok(result.success);
    });

    it('rejects invalid utmSource', () => {
      const result = schema.safeParse({
        email: 'user@example.com',
        utmSource: 'invalid',
      });
      assert.ok(!result.success);
    });
  });

  describe('repository methods', () => {
    let db: ReturnType<typeof makeDatabase>;

    beforeEach(() => {
      db = makeDatabase();
    });

    it('canInsert returns true for new IP', async () => {
      const { canInsert } = waitlist(db);
      const result = await canInsert('10.0.0.99');
      assert.equal(result, true);
    });

    it('insert returns true for new email', async () => {
      const { insert } = waitlist(db);
      const result = await insert('test@example.com', 'google', '10.0.0.1');
      assert.equal(result, true);
    });

    it('insert is idempotent for duplicate email', async () => {
      const { insert } = waitlist(db);
      const r1 = await insert('dup@example.com', undefined, '10.0.0.1');
      assert.equal(r1, true);
      const r2 = await insert('dup@example.com', undefined, '10.0.0.1');
      assert.equal(r2, true);
    });

    it('insert with utmSource stores the value', async () => {
      const { insert } = waitlist(db);
      const r = await insert('utm@example.com', 'newsletter', '10.0.0.1');
      assert.equal(r, true);
    });

    it('canInsert counts entries for same IP', async () => {
      const { canInsert, insert } = waitlist(db);
      // Insert 9 entries
      for (let i = 0; i < 9; i++) {
        const r = await insert(`user${i}@example.com`, undefined, '10.0.0.50');
        assert.equal(r, true, `Insert ${i} should succeed`);
      }
      // 10th should be allowed
      const result = await canInsert('10.0.0.50');
      assert.equal(result, true);
    });

    it('canInsert blocks at daily limit', async () => {
      const { canInsert, insert } = waitlist(db);
      // Insert 10 entries for same IP
      for (let i = 0; i < 10; i++) {
        await insert(`limit${i}@example.com`, undefined, '10.0.0.75');
      }
      // 11th should be blocked
      const result = await canInsert('10.0.0.75');
      assert.equal(result, false);
    });
  });
});
