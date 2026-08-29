import { assert, describe, it } from 'poku';
import {
  checkRateLimit,
  getRateLimitKey,
  MAX_REQUESTS,
} from '../../src/server/configs/rate-limit.js';

const makeRequest = (ipAddress: string): Request =>
  new Request('https://example.com/api/waitlist', {
    method: 'POST',
    headers: { 'CF-Connecting-IP': ipAddress },
  });

describe('Rate Limit', () => {
  describe('getRateLimitKey', () => {
    it('uses CF-Connecting-IP when available', () => {
      const request = new Request('https://example.com', {
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      assert.equal(getRateLimitKey(request), '1.2.3.4');
    });

    it('falls back to X-Forwarded-For', () => {
      const request = new Request('https://example.com', {
        headers: { 'X-Forwarded-For': '5.6.7.8' },
      });

      assert.equal(getRateLimitKey(request), '5.6.7.8');
    });

    it('falls back to unknown when no headers are present', () => {
      const request = new Request('https://example.com');

      assert.equal(getRateLimitKey(request), 'unknown');
    });
  });

  describe('checkRateLimit', () => {
    const originalDateNow = Date.now;

    it('allows requests under the limit', () => {
      const request = makeRequest('under-limit');
      for (let index = 0; index < MAX_REQUESTS; index++) {
        const result = checkRateLimit(request);

        assert.equal(result.allowed, true);
      }
    });

    it('blocks the request just past the limit in the same window', () => {
      const request = makeRequest('over-limit');

      for (let index = 0; index < MAX_REQUESTS; index++)
        checkRateLimit(request);

      const result = checkRateLimit(request);

      assert.equal(result.allowed, false);
      assert.ok(result.retryAfterSeconds > 0);
    });

    it('resets after the window expires', () => {
      let now = 1000000;
      Date.now = () => now;

      const request = makeRequest('window-reset');

      for (let index = 0; index <= MAX_REQUESTS; index++)
        checkRateLimit(request);

      const blocked = checkRateLimit(request);

      assert.equal(blocked.allowed, false);

      now += 60001;

      const allowed = checkRateLimit(request);

      assert.equal(allowed.allowed, true);

      Date.now = originalDateNow;
    });

    it('tracks different IPs independently', () => {
      const requestA = makeRequest('independent-a');
      const requestB = makeRequest('independent-b');

      for (let index = 0; index < MAX_REQUESTS; index++)
        checkRateLimit(requestA);

      const resultB = checkRateLimit(requestB);

      assert.equal(resultB.allowed, true);

      const resultA = checkRateLimit(requestA);

      assert.equal(resultA.allowed, false);
    });
  });
});
