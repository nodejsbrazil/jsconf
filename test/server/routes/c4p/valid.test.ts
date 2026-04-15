import { assert, describe, it } from 'poku';
import {
  makeMockDatabase,
  makeRequest,
  makeValidBody,
  post,
} from './__utils__.js';

describe('routes.c4p (valid input)', async () => {
  await describe('honeypot', async () => {
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

  await describe('happy path', async () => {
    await it('persists the received data across speakers, diversity and talks', async () => {
      const mock = makeMockDatabase();
      const body = makeValidBody({
        linkedin: 'https://linkedin.com/in/ada',
        instagram: '@ada',
        youtube: 'https://youtube.com/@ada',
        github: 'https://github.com/ada',
        website: 'https://ada.dev',
        gender: 1,
        race: 2,
        disability: 0,
      });
      const ip = '203.0.113.42';
      const res = await post(makeRequest(body), mock, ip);

      assert.equal(res.status, 201);
      assert.deepEqual(await res.json(), { success: true });
      assert.deepEqual(mock.speakersInsert, [
        body.name,
        body.email,
        body.phone,
        body.city,
        body.state,
        body.travelPreference,
        body.linkedin,
        body.instagram,
        body.youtube,
        body.github,
        body.website,
        body.experienceLevel,
        body.bio,
        ip,
      ]);
      assert.deepEqual(mock.diversityInsert, [
        1,
        body.gender,
        body.race,
        body.disability,
      ]);
      assert.deepEqual(mock.talksInsert, [
        1,
        body.duration,
        body.talkTitle,
        body.talkDescription,
        body.audienceLevel,
        body.talkReason,
      ]);
    });

    await it('applies schema defaults for optional socials and diversity fields', async () => {
      const mock = makeMockDatabase();
      const res = await post(makeRequest(makeValidBody()), mock);
      const speakers = mock.speakersInsert as unknown[];

      assert.equal(res.status, 201);
      assert.ok(mock.speakersInsert);
      assert.equal(speakers[6], '');
      assert.equal(speakers[7], '');
      assert.equal(speakers[8], '');
      assert.equal(speakers[9], '');
      assert.equal(speakers[10], '');
      assert.deepEqual(mock.diversityInsert, [1, 3, 6, 5]);
    });
  });

  await describe('talk limit', async () => {
    await it('returns 422 when the speaker already has 3 talks', async () => {
      const mock = makeMockDatabase({ talkCount: 3 });
      const res = await post(makeRequest(makeValidBody()), mock);

      assert.equal(res.status, 422);
      assert.deepEqual(await res.json(), { error: 'Talk limit exceeded.' });
      assert.equal(mock.talksInsert, null);
    });
  });

  await describe('internal error', async () => {
    await it('returns 500 when the speaker lookup returns no row', async () => {
      const mock = makeMockDatabase({ speakerId: null });
      const res = await post(makeRequest(makeValidBody()), mock);

      assert.equal(res.status, 500);
      assert.deepEqual(await res.json(), { error: 'Internal error.' });
    });
  });
});
