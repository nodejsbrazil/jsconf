import { assert, describe, it } from 'poku';
import { generateTokens } from '../../../../src/server/lib/tokens.js';
import { makeDatabase, makeRequest, route } from './__utils__.js';

const TEST_SECRET = 'test-secret-32-chars-minimum-here';

describe('routes.votingState (invalid input)', async () => {
  await it('returns 401 when no Authorization header', async () => {
    const database = makeDatabase();
    const res = await route(makeRequest(), database);

    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: 'unauthorized' });
  });

  await it('returns 401 when token is invalid', async () => {
    const database = makeDatabase();
    const res = await route(
      makeRequest({ headers: { Authorization: 'Bearer invalid-token' } }),
      database
    );

    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: 'unauthorized' });
  });

  await it('returns 401 when user does not exist', async () => {
    const database = makeDatabase();
    const tokens = await generateTokens(
      { id: 9999, email: 'ghost@example.com' },
      TEST_SECRET
    );
    const res = await route(
      makeRequest({
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }),
      database
    );

    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: 'unauthorized' });
  });
});
