import { assert, describe, it } from 'poku';
import { json } from '../json';

describe('json()', () => {
  it('serializes the body to JSON', async () => {
    const res = json({ error: 'test' }, 400);
    const body = await res.json();
    assert.deepEqual(body, { error: 'test' });
  });

  it('sets the correct status code', () => {
    assert.equal(json({}, 201).status, 201);
    assert.equal(json({}, 404).status, 404);
    assert.equal(json({}, 422).status, 422);
  });

  it('sets Content-Type: application/json', () => {
    const res = json({}, 200);
    assert.equal(res.headers.get('Content-Type'), 'application/json');
  });

  it('merges extra headers', () => {
    const res = json({}, 200, { 'X-Custom': 'value' });
    assert.equal(res.headers.get('X-Custom'), 'value');
  });

  it('extra headers override defaults', () => {
    const res = json({}, 200, { 'Content-Type': 'text/plain' });
    assert.equal(res.headers.get('Content-Type'), 'text/plain');
  });
});
