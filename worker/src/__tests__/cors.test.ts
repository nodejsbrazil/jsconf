import { assert, describe, it } from 'poku';
import { corsHeaders } from '../cors';

describe('corsHeaders()', () => {
  it('sets Access-Control-Allow-Origin to the provided origin', () => {
    const headers = corsHeaders('https://example.com');
    assert.equal(headers['Access-Control-Allow-Origin'], 'https://example.com');
  });

  it('allows POST and OPTIONS methods', () => {
    const headers = corsHeaders('*');
    assert.ok(headers['Access-Control-Allow-Methods']?.includes('POST'));
    assert.ok(headers['Access-Control-Allow-Methods']?.includes('OPTIONS'));
  });

  it('allows Content-Type header', () => {
    const headers = corsHeaders('*');
    assert.equal(headers['Access-Control-Allow-Headers'], 'Content-Type');
  });

  it('sets Vary: Origin', () => {
    const headers = corsHeaders('*');
    assert.equal(headers.Vary, 'Origin');
  });
});
