import { assert, describe, it } from 'poku';
import { makeDatabase, makeRequest, route } from './__utils__.js';

describe('routes.logout (invalid input)', async () => {
  await it('returns 401 for unknown refresh token', async () => {
    const db = makeDatabase();
    const res = await route(
      makeRequest({ refresh_token: 'unknown-token' }),
      db
    );
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: 'invalid_refresh_token' });
  });
});
