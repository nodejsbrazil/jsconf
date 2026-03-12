import { assert, describe, it } from 'poku';
import { response } from '../../src/server/helpers/response';

describe('response()', () => {
  it('serializes the body to JSON', async () => {
    const res = response({ error: 'test' }, 400);
    const body = await res.json();
    assert.deepEqual(body, { error: 'test' });
  });

  it('sets the correct status code', () => {
    assert.equal(response({}, 201).status, 201);
    assert.equal(response({}, 404).status, 404);
    assert.equal(response({}, 422).status, 422);
  });

  it('sets Content-Type: application/json', () => {
    const res = response({}, 200);
    assert.equal(res.headers.get('Content-Type'), 'application/json');
  });

  it('merges extra headers', () => {
    const res = response({}, 200, { 'X-Custom': 'value' });
    assert.equal(res.headers.get('X-Custom'), 'value');
  });

  it('extra headers override defaults', () => {
    const res = response({}, 200, { 'Content-Type': 'text/plain' });
    assert.equal(res.headers.get('Content-Type'), 'text/plain');
  });
});
