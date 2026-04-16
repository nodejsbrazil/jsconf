import type { Database } from '../../../../src/server/types.js';
import { routes } from '../../../../src/server/routes.js';

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Vary: 'Origin',
};

export type ValidBody = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  travelPreference: number;
  experienceLevel: number;
  bio: string;
  duration: number;
  talkTitle: string;
  talkDescription: string;
  audienceLevel: number;
  talkReason: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
  website?: string;
  gender?: number;
  race?: number;
  disability?: number;
  confirm_email?: string;
};

export const makeValidBody = (
  overrides: Partial<ValidBody> = {}
): ValidBody => ({
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '11999998888',
  city: 'São Paulo',
  state: 'SP',
  travelPreference: 0,
  experienceLevel: 2,
  bio: 'Engineer and mathematician.',
  duration: 0,
  talkTitle: 'On computing',
  talkDescription: 'A talk about analytical engines.',
  audienceLevel: 1,
  talkReason: 'To share knowledge.',
  ...overrides,
});

export type MockDatabase = {
  database: Database;
  speakersInsert: unknown[] | null;
  diversityInsert: unknown[] | null;
  talksInsert: unknown[] | null;
};

export const makeMockDatabase = (
  opts: { speakerId?: number | null; talkCount?: number } = {}
): MockDatabase => {
  const speakerId = opts.speakerId === undefined ? 1 : opts.speakerId;
  const talkCount = opts.talkCount ?? 0;

  const mock: MockDatabase = {
    speakersInsert: null,
    diversityInsert: null,
    talksInsert: null,
    database: {
      prepare: (sql: string) => ({
        bind: (...values: unknown[]) => ({
          run: async () => {
            if (sql.includes('INTO speakers')) mock.speakersInsert = values;
            else if (sql.includes('INTO speaker_diversity'))
              mock.diversityInsert = values;
            else if (sql.includes('INTO talks')) mock.talksInsert = values;
          },
          all: async <T>() => {
            if (sql.includes('FROM speakers')) {
              const results = speakerId === null ? [] : [{ id: speakerId }];
              return { results: results as T[] };
            }
            if (sql.includes('FROM talks'))
              return { results: [{ total: talkCount }] as T[] };
            return { results: [] as T[] };
          },
        }),
      }),
    },
  };
  return mock;
};

export const makeRequest = (
  body: unknown,
  init: { contentType?: string | null; raw?: string } = {}
): Request => {
  const headers: Record<string, string> = {};
  if (init.contentType !== null)
    headers['Content-Type'] = init.contentType ?? 'application/json';
  return new Request('http://localhost/api/c4p', {
    method: 'POST',
    headers,
    body: init.raw ?? JSON.stringify(body),
  });
};

export const post = async (
  request: Request,
  mock: MockDatabase,
  ip = 'abc123'
): Promise<Response> =>
  routes.c4p({
    request,
    cors,
    database: mock.database,
    ip,
  });
