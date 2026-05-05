import { assert, describe, it } from 'poku';
import {
  UsersBatchResultSchema,
  UsersBatchUpsertResultSchema,
} from '../../../../src/server/routes/users-batch.js';
import { parseJsonResponse } from '../../helpers.js';
import {
  makeDatabase,
  makeRequest,
  makeValidBody,
  route,
} from './__utils__.js';

describe('routes.usersBatch (valid input)', async () => {
  await it('returns 201 with code for a single user', async () => {
    const database = makeDatabase();
    const res = await route(
      makeRequest(makeValidBody(), { headers: { ADMIN_KEY: 'secret' } }),
      database
    );

    assert.equal(res.status, 201);
    const json = await parseJsonResponse(
      Promise.resolve(res),
      UsersBatchResultSchema
    );

    assert.equal(json.results.length, 1);
    const first = json.results[0];

    assert.equal(first?.email, 'test@example.com');
    assert.equal(first?.code.length, 4);

    const { results } = await database
      .prepare('SELECT email, code FROM users WHERE email = ?')
      .bind('test@example.com')
      .all<{ email: string; code: string }>();

    assert.equal(results.length, 1);
    assert.equal(results[0]?.code, json.results[0]?.code);
  });

  await it('returns 201 with codes for multiple users', async () => {
    const database = makeDatabase();
    const body = makeValidBody({
      users: [
        {
          email: 'a@example.com',
          ticket_type: 1,
          votes_allowed: 5,
          quantity: 1,
        },
        {
          email: 'b@example.com',
          ticket_type: 2,
          votes_allowed: 10,
          quantity: 1,
        },
      ],
    });
    const res = await route(
      makeRequest(body, { headers: { ADMIN_KEY: 'secret' } }),
      database
    );

    assert.equal(res.status, 201);
    const json = await parseJsonResponse(
      Promise.resolve(res),
      UsersBatchResultSchema
    );
    assert.equal(json.results.length, 2);

    const { results } = await database
      .prepare('SELECT COUNT(*) as count FROM users')
      .bind()
      .all<{ count: number }>();
    assert.equal(results[0]?.count, 2);
  });

  await it('upserts duplicate email in batch and returns 201', async () => {
    const database = makeDatabase();

    await route(
      makeRequest(
        makeValidBody({
          users: [
            {
              email: 'dup@example.com',
              ticket_type: 1,
              votes_allowed: 5,
              quantity: 1,
            },
          ],
        }),
        { headers: { ADMIN_KEY: 'secret' } }
      ),
      database
    );

    const res = await route(
      makeRequest(
        makeValidBody({
          users: [
            {
              email: 'dup@example.com',
              ticket_type: 2,
              votes_allowed: 8,
              quantity: 2,
            },
          ],
        }),
        { headers: { ADMIN_KEY: 'secret' } }
      ),
      database
    );

    assert.equal(res.status, 201);
    const json = await parseJsonResponse(
      Promise.resolve(res),
      UsersBatchUpsertResultSchema
    );

    assert.equal(json.results.length, 1);
    assert.equal(json.results[0]?.email, 'dup@example.com');

    const { results } = await database
      .prepare(
        'SELECT ticket_type, votes_allowed, quantity FROM users WHERE email = ?'
      )
      .bind('dup@example.com')
      .all<{ ticket_type: number; votes_allowed: number; quantity: number }>();

    assert.equal(results.length, 1);
    assert.deepEqual(results[0], {
      ticket_type: 2,
      votes_allowed: 13,
      quantity: 3,
    });
  });

  await it('works with correct ADMIN_KEY header', async () => {
    const database = makeDatabase();
    const res = await route(
      makeRequest(makeValidBody(), { headers: { ADMIN_KEY: 'secret' } }),
      database
    );

    assert.equal(res.status, 201);
  });
});
