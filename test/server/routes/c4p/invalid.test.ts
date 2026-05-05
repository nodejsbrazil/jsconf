import { assert, describe, it } from 'poku';
import {
  makeMockDatabase,
  makeRequest,
  makeValidBody,
  post,
} from './__utils__.js';

const expectRejected = async (
  body: unknown,
  status: number,
  error?: string
): Promise<void> => {
  const mock = makeMockDatabase();
  const res = await post(makeRequest(body), mock);

  assert.equal(res.status, status);

  if (error)
    assert.equal(((await res.json()) as { error: string }).error, error);

  assert.equal(mock.speakersInsert, null);
  assert.equal(mock.diversityInsert, null);
  assert.equal(mock.talksInsert, null);
};

describe('routes.c4p (invalid input)', async () => {
  await describe('transport guards', async () => {
    await it('returns 415 for a non-JSON content type', async () => {
      const mock = makeMockDatabase();
      const res = await post(
        makeRequest(makeValidBody(), { contentType: 'text/plain' }),
        mock
      );

      assert.equal(res.status, 415);
      assert.deepEqual(await res.json(), {
        error: 'Content-Type must be application/json',
      });
    });

    await it('returns 415 when the Content-Type header is missing', async () => {
      const mock = makeMockDatabase();
      const res = await post(
        makeRequest(makeValidBody(), { contentType: null }),
        mock
      );

      assert.equal(res.status, 415);
    });

    await it('returns 422 when the payload exceeds 16384 bytes', async () => {
      const mock = makeMockDatabase();
      const body = makeValidBody({ bio: 'x'.repeat(17000) });
      const res = await post(makeRequest(body), mock);

      assert.equal(res.status, 422);
      assert.equal(
        ((await res.json()) as { error: string }).error,
        'Validation failed'
      );
    });

    await it('returns 400 for malformed JSON', async () => {
      const mock = makeMockDatabase();
      const res = await post(makeRequest(null, { raw: '{not json' }), mock);

      assert.equal(res.status, 400);
      assert.deepEqual(await res.json(), { error: 'Invalid JSON.' });
    });

    await it('returns 400 for an empty body', async () => {
      const mock = makeMockDatabase();
      const res = await post(makeRequest(null, { raw: '' }), mock);

      assert.equal(res.status, 400);
    });
  });

  await describe('schema rejections', async () => {
    await it('rejects a completely empty object', async () => {
      await expectRejected({}, 422, 'Validation failed');
    });

    await describe('name', async () => {
      await it('rejects missing name', async () => {
        const { name: _name, ...rest } = makeValidBody();

        await expectRejected(rest, 422);
      });

      await it('rejects empty name', async () => {
        await expectRejected(makeValidBody({ name: '' }), 422);
      });

      await it('rejects whitespace-only name', async () => {
        await expectRejected(makeValidBody({ name: '   ' }), 422);
      });
    });

    await describe('email', async () => {
      await it('rejects missing email', async () => {
        const { email: _email, ...rest } = makeValidBody();

        await expectRejected(rest, 422);
      });

      await it('rejects malformed email', async () => {
        await expectRejected(makeValidBody({ email: 'not-an-email' }), 422);
      });

      await it('rejects emails longer than 254 chars', async () => {
        const local = 'a'.repeat(250);

        await expectRejected(
          makeValidBody({ email: `${local}@example.com` }),
          422
        );
      });
    });

    await describe('phone', async () => {
      await it('rejects phone shorter than 8 chars', async () => {
        await expectRejected(makeValidBody({ phone: '1234567' }), 422);
      });
    });

    await describe('city', async () => {
      await it('rejects missing city', async () => {
        const { city: _city, ...rest } = makeValidBody();

        await expectRejected(rest, 422);
      });

      await it('rejects empty city', async () => {
        await expectRejected(makeValidBody({ city: '' }), 422);
      });
    });

    await describe('state', async () => {
      await it('rejects state with 1 char', async () => {
        await expectRejected(makeValidBody({ state: 'S' }), 422);
      });

      await it('rejects state with 3 chars', async () => {
        await expectRejected(makeValidBody({ state: 'SPX' }), 422);
      });

      await it('rejects empty state', async () => {
        await expectRejected(makeValidBody({ state: '' }), 422);
      });
    });

    await describe('travelPreference', async () => {
      await it('rejects out-of-range value', async () => {
        await expectRejected(makeValidBody({ travelPreference: 2 }), 422);
      });

      await it('rejects negative value', async () => {
        await expectRejected(makeValidBody({ travelPreference: -1 }), 422);
      });
    });

    await describe('experienceLevel', async () => {
      await it('rejects out-of-range value', async () => {
        await expectRejected(makeValidBody({ experienceLevel: 4 }), 422);
      });

      await it('rejects negative value', async () => {
        await expectRejected(makeValidBody({ experienceLevel: -1 }), 422);
      });
    });

    await describe('bio', async () => {
      await it('rejects empty bio', async () => {
        await expectRejected(makeValidBody({ bio: '' }), 422);
      });

      await it('rejects bio longer than 280 chars', async () => {
        await expectRejected(makeValidBody({ bio: 'x'.repeat(281) }), 422);
      });
    });

    await describe('duration', async () => {
      await it('rejects out-of-range value', async () => {
        await expectRejected(makeValidBody({ duration: 2 }), 422);
      });

      await it('rejects negative value', async () => {
        await expectRejected(makeValidBody({ duration: -1 }), 422);
      });
    });

    await describe('talkTitle', async () => {
      await it('rejects missing talkTitle', async () => {
        const { talkTitle: _talkTitle, ...rest } = makeValidBody();

        await expectRejected(rest, 422);
      });

      await it('rejects empty talkTitle', async () => {
        await expectRejected(makeValidBody({ talkTitle: '' }), 422);
      });
    });

    await describe('talkDescription', async () => {
      await it('rejects missing talkDescription', async () => {
        const { talkDescription: _talkDescription, ...rest } = makeValidBody();

        await expectRejected(rest, 422);
      });

      await it('rejects empty talkDescription', async () => {
        await expectRejected(makeValidBody({ talkDescription: '' }), 422);
      });
    });

    await describe('audienceLevel', async () => {
      await it('rejects out-of-range value', async () => {
        await expectRejected(makeValidBody({ audienceLevel: 4 }), 422);
      });

      await it('rejects negative value', async () => {
        await expectRejected(makeValidBody({ audienceLevel: -1 }), 422);
      });
    });

    await describe('talkReason', async () => {
      await it('rejects missing talkReason', async () => {
        const { talkReason: _talkReason, ...rest } = makeValidBody();

        await expectRejected(rest, 422);
      });

      await it('rejects empty talkReason', async () => {
        await expectRejected(makeValidBody({ talkReason: '' }), 422);
      });
    });

    await describe('optional diversity enums', async () => {
      await it('rejects gender out of range', async () => {
        await expectRejected(makeValidBody({ gender: 4 }), 422);
      });

      await it('rejects race out of range', async () => {
        await expectRejected(makeValidBody({ race: 7 }), 422);
      });

      await it('rejects disability out of range', async () => {
        await expectRejected(makeValidBody({ disability: 6 }), 422);
      });
    });
  });
});
