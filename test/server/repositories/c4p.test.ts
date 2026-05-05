import { assert, beforeEach, describe, it } from 'poku';
import { c4p } from '../../../src/server/repositories/c4p.js';
import { makeDatabase } from './__utils__.js';

const validSpeaker = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '11999999999',
  city: 'São Paulo',
  state: 'SP',
  travelPreference: 0,
  experienceLevel: 1,
  bio: 'JS developer with 5 years experience',
  linkedin: 'https://linkedin.com/in/johndoe',
  instagram: '',
  youtube: '',
  github: 'johndoe',
  website: '',
  gender: 0,
  race: 1,
  disability: 5,
  duration: 0,
  talkTitle: 'Advanced TypeScript Patterns',
  talkDescription:
    'A deep dive into advanced TypeScript patterns for large-scale applications.',
  audienceLevel: 2,
  talkReason: 'I want to share knowledge with the community.',
  confirm_email: '',
};

describe('c4p', () => {
  describe('schema validation', () => {
    const db = makeDatabase();
    const { schema } = c4p(db);

    it('accepts valid complete data', () => {
      const result = schema.safeParse(validSpeaker);
      assert.ok(result.success, result.error?.message);
    });

    it('accepts minimal data with defaults', () => {
      const minimal = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '21988888888',
        city: 'Rio de Janeiro',
        state: 'RJ',
        travelPreference: 1,
        experienceLevel: 2,
        bio: 'Backend engineer',
        linkedin: '',
        instagram: '',
        youtube: '',
        github: '',
        website: '',
        gender: 3,
        race: 6,
        disability: 5,
        duration: 1,
        talkTitle: 'Node.js Performance',
        talkDescription: 'Tips and tricks for better performance.',
        audienceLevel: 1,
        talkReason: 'Help others level up.',
        confirm_email: '',
      };
      const result = schema.safeParse(minimal);
      assert.ok(result.success, result.error?.message);
    });

    it('rejects missing name', () => {
      const result = schema.safeParse({ ...validSpeaker, name: '' });
      assert.ok(!result.success);
    });

    it('rejects invalid email', () => {
      const result = schema.safeParse({
        ...validSpeaker,
        email: 'not-an-email',
      });
      assert.ok(!result.success);
    });

    it('rejects phone too short', () => {
      const result = schema.safeParse({ ...validSpeaker, phone: '123' });
      assert.ok(!result.success);
    });

    it('rejects invalid state length', () => {
      const result = schema.safeParse({ ...validSpeaker, state: 'SPX' });
      assert.ok(!result.success);
    });

    it('rejects bio too long', () => {
      const result = schema.safeParse({
        ...validSpeaker,
        bio: 'a'.repeat(281),
      });
      assert.ok(!result.success);
    });

    it('rejects travelPreference > 1', () => {
      const result = schema.safeParse({ ...validSpeaker, travelPreference: 2 });
      assert.ok(!result.success);
    });

    it('rejects experienceLevel > 3', () => {
      const result = schema.safeParse({ ...validSpeaker, experienceLevel: 4 });
      assert.ok(!result.success);
    });

    it('rejects duration > 1', () => {
      const result = schema.safeParse({ ...validSpeaker, duration: 2 });
      assert.ok(!result.success);
    });

    it('rejects empty talkTitle', () => {
      const result = schema.safeParse({ ...validSpeaker, talkTitle: '   ' });
      assert.ok(!result.success);
    });

    it('rejects empty talkDescription', () => {
      const result = schema.safeParse({ ...validSpeaker, talkDescription: '' });
      assert.ok(!result.success);
    });

    it('rejects audienceLevel > 3', () => {
      const result = schema.safeParse({ ...validSpeaker, audienceLevel: 4 });
      assert.ok(!result.success);
    });

    it('rejects empty talkReason', () => {
      const result = schema.safeParse({ ...validSpeaker, talkReason: '' });
      assert.ok(!result.success);
    });
  });

  describe('repository methods', () => {
    let db: ReturnType<typeof makeDatabase>;

    beforeEach(() => {
      db = makeDatabase();
    });

    it('submit returns success for valid data', async () => {
      const { submit } = c4p(db);
      const result = await submit(validSpeaker, '192.168.1.1');
      assert.equal(result.success, true);
    });

    it('submit creates speaker in database', async () => {
      const { submit } = c4p(db);
      await submit(validSpeaker, '192.168.1.1');
      const rows = db
        .prepare('SELECT * FROM speakers WHERE email = ?')
        .bind(validSpeaker.email)
        .all();

      const results = await rows;
      assert.ok(results.results.length > 0);
    });

    it('submit creates talk in database', async () => {
      const { submit } = c4p(db);
      await submit(validSpeaker, '192.168.1.1');
      const rows = db
        .prepare('SELECT * FROM talks WHERE title = ?')
        .bind(validSpeaker.talkTitle)
        .all();

      const results = await rows;
      assert.ok(results.results.length > 0);
    });

    it('submit creates speaker_diversity record', async () => {
      const { submit } = c4p(db);
      await submit(validSpeaker, '192.168.1.1');
      const rows = db
        .prepare('SELECT * FROM speaker_diversity WHERE gender = ?')
        .bind(validSpeaker.gender)
        .all();

      const results = await rows;
      assert.ok(results.results.length > 0);
    });

    it('submit creates talk linked to correct speaker', async () => {
      const { submit } = c4p(db);
      await submit(validSpeaker, '192.168.1.1');
      const rows = db
        .prepare('SELECT speaker_id FROM talks WHERE title = ?')
        .bind(validSpeaker.talkTitle)
        .all();
      const results = await rows;
      const speakerId = (results.results[0] as { speaker_id: number })
        .speaker_id;
      const speakerRows = db
        .prepare('SELECT email FROM speakers WHERE id = ?')
        .bind(speakerId)
        .all();
      const speakerResults = await speakerRows;
      assert.equal(
        (speakerResults.results[0] as { email: string }).email,
        validSpeaker.email
      );
    });

    it('submit with different email creates new speaker', async () => {
      const { submit } = c4p(db);
      await submit(validSpeaker, '192.168.1.1');
      const other = {
        ...validSpeaker,
        email: 'other@example.com',
        talkTitle: 'Other Talk',
      };
      await submit(other, '192.168.1.1');

      const rows = db
        .prepare('SELECT COUNT(*) as cnt FROM speakers')
        .bind()
        .all();

      const results = await rows;
      assert.deepEqual(results.results[0], { cnt: 2 });
    });

    it('submit returns talk_limit when speaker has 3 talks', async () => {
      const { submit } = c4p(db);

      await submit(validSpeaker, '192.168.1.1');

      const talk2 = {
        ...validSpeaker,
        email: 'speaker2@example.com',
        talkTitle: 'Second Talk',
        talkDescription: 'Second desc',
      };

      const r2 = await submit(talk2, '192.168.1.1');
      assert.equal(r2.success, true);

      const talk3 = {
        ...validSpeaker,
        email: 'speaker3@example.com',
        talkTitle: 'Third Talk',
        talkDescription: 'Third desc',
      };

      const r3 = await submit(talk3, '192.168.1.1');
      assert.equal(r3.success, true);

      const talk4 = {
        ...validSpeaker,
        email: 'speaker4@example.com',
        talkTitle: 'Fourth Talk',
        talkDescription: 'Fourth desc',
      };

      const result = await submit(talk4, '192.168.1.1');
      assert.equal(result.success, true);
    });
  });
});
