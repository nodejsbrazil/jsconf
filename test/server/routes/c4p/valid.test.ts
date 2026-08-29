import { assert, describe, it } from 'poku';
import { isC4pOpen } from '../../../../src/server/configs/c4p.js';
import {
  makeMockDatabase,
  makeRequest,
  makeValidBody,
  post,
} from './__utils__.js';

describe('configs.c4p', async () => {
  await it('isC4pOpen is false: submissions are closed', () => {
    assert.equal(isC4pOpen(), false);
  });
});

describe('routes.c4p (valid input)', async () => {
  await describe('honeypot', async () => {
    // Checked before the closed gate, so bots still get silently faked out either way.
    await it('silently returns 201 without touching the database', async () => {
      const mock = makeMockDatabase();
      const res = await post(
        makeRequest(makeValidBody({ confirm_email: 'bot@spam.io' })),
        mock
      );

      assert.equal(res.status, 201);
      assert.deepEqual(await res.json(), { success: true });
      assert.equal(mock.speakersInsert, null);
      assert.equal(mock.diversityInsert, null);
      assert.equal(mock.talksInsert, null);
    });
  });

  await describe('closed submissions', async () => {
    await it('rejects an otherwise-valid submission with 403 and touches nothing', async () => {
      const mock = makeMockDatabase();
      const res = await post(makeRequest(makeValidBody()), mock);

      assert.equal(res.status, 403);
      assert.deepEqual(await res.json(), { error: 'C4P closed.' });
      assert.equal(mock.speakersInsert, null);
      assert.equal(mock.diversityInsert, null);
      assert.equal(mock.talksInsert, null);
    });
  });
});
