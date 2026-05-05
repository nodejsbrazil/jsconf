import { assert, describe, it } from 'poku';
import {
  makeDatabase,
  makeRequest,
  makeValidBody,
  route,
} from './__utils__.js';

describe('routes.usersBatch (invalid input)', async () => {
  await describe('transport guards', async () => {
    await it('returns 415 for a non-JSON content type', async () => {
      const database = makeDatabase();
      const res = await route(
        makeRequest(makeValidBody(), {
          headers: { 'Content-Type': 'text/plain' },
        }),
        database
      );

      assert.equal(res.status, 415);
      assert.deepEqual(await res.json(), {
        error: 'Content-Type must be application/json',
      });
    });

    await it('returns 401 for an oversized payload without ADMIN_KEY', async () => {
      const database = makeDatabase();
      const body = makeValidBody({
        users: Array.from({ length: 2000 }, () => ({
          email: `${'a'.repeat(100)}@example.com`,
          ticket_type: 1,
          votes_allowed: 5,
          quantity: 1,
        })),
      });
      const res = await route(makeRequest(body), database);

      assert.equal(res.status, 401);
      assert.deepEqual(await res.json(), { error: 'Unauthorized' });
    });

    await it('returns 400 for malformed JSON', async () => {
      const database = makeDatabase();
      const res = await route(
        makeRequest(null, { raw: '{not json' }),
        database
      );

      assert.equal(res.status, 400);
      assert.deepEqual(await res.json(), { error: 'Invalid JSON.' });
    });
  });

  await describe('auth guards', async () => {
    await it('returns 401 when ADMIN_KEY header is missing', async () => {
      const database = makeDatabase();
      const res = await route(
        makeRequest(makeValidBody()),
        database,
        undefined as unknown as string
      );

      assert.equal(res.status, 401);
      assert.deepEqual(await res.json(), { error: 'Unauthorized' });
    });

    await it('returns 401 when ADMIN_KEY is wrong', async () => {
      const database = makeDatabase();
      const res = await route(
        makeRequest(makeValidBody(), { headers: { ADMIN_KEY: 'wrong' } }),
        database
      );

      assert.equal(res.status, 401);
      assert.deepEqual(await res.json(), { error: 'Unauthorized' });
    });
  });

  await describe('schema rejections', async () => {
    await it('returns 422 for missing users field', async () => {
      const database = makeDatabase();
      const res = await route(
        makeRequest({}, { headers: { ADMIN_KEY: 'secret' } }),
        database
      );

      assert.equal(res.status, 422);
    });

    await it('returns 422 when users is not an array', async () => {
      const database = makeDatabase();
      const res = await route(
        makeRequest(
          { users: 'not-array' },
          { headers: { ADMIN_KEY: 'secret' } }
        ),
        database
      );

      assert.equal(res.status, 422);
    });

    await it('returns 422 when users is an empty array', async () => {
      const database = makeDatabase();
      const res = await route(
        makeRequest({ users: [] }, { headers: { ADMIN_KEY: 'secret' } }),
        database
      );

      assert.equal(res.status, 422);
    });

    await it('returns 422 for invalid email in users[0]', async () => {
      const database = makeDatabase();
      const res = await route(
        makeRequest(
          { users: [{ email: 'invalid', ticket_type: 1, votes_allowed: 5 }] },
          { headers: { ADMIN_KEY: 'secret' } }
        ),
        database
      );

      assert.equal(res.status, 422);
    });

    await it('returns 422 for ticket_type > 10', async () => {
      const database = makeDatabase();
      const res = await route(
        makeRequest(
          { users: [{ email: 'a@b.com', ticket_type: 11, votes_allowed: 5 }] },
          { headers: { ADMIN_KEY: 'secret' } }
        ),
        database
      );

      assert.equal(res.status, 422);
    });

    await it('returns 422 for votes_allowed > 100', async () => {
      const database = makeDatabase();
      const res = await route(
        makeRequest(
          {
            users: [{ email: 'a@b.com', ticket_type: 1, votes_allowed: 101 }],
          },
          { headers: { ADMIN_KEY: 'secret' } }
        ),
        database
      );

      assert.equal(res.status, 422);
    });
  });
});
