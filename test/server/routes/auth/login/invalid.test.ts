import { assert, describe, it } from 'poku';
import {
  makeDatabase,
  makeRequest,
  makeValidBody,
  route,
} from './__utils__.js';

describe('routes.login (invalid input)', async () => {
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
    });

    await it('returns 422 when the code exceeds 4 chars', async () => {
      const database = makeDatabase();
      const res = await route(
        makeRequest(makeValidBody({ code: 'x'.repeat(2000) })),
        database
      );

      assert.equal(res.status, 422);
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

  await describe('schema rejections', async () => {
    await it('returns 422 for missing code field', async () => {
      const database = makeDatabase();
      const res = await route(makeRequest({}), database);

      assert.equal(res.status, 422);
    });

    await it('returns 422 when code is not 4 digits', async () => {
      const database = makeDatabase();
      const res = await route(makeRequest({ code: '123' }), database);

      assert.equal(res.status, 422);
    });
  });

  await describe('business rules', async () => {
    await it('returns 404 for a valid code that does not exist', async () => {
      const database = makeDatabase();
      const res = await route(makeRequest({ code: '9999' }), database);

      assert.equal(res.status, 404);
      assert.deepEqual(await res.json(), { error: 'User not found' });
    });

    await it('returns 500 on database error during findByCode', async () => {
      const database = makeDatabase();
      const originalPrepare = database.prepare.bind(database);
      database.prepare = (sql: string) => {
        if (sql.includes('users')) {
          throw new Error('DB failure');
        }
        return originalPrepare(sql);
      };

      const res = await route(makeRequest({ code: '1234' }), database);
      assert.equal(res.status, 500);
    });
  });
});
