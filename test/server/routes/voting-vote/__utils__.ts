import type { CodeSender } from '../../../../src/server/code-sender.js';
import type {
  Database as AppDatabase,
  Env,
} from '../../../../src/server/types.js';
import { readFileSync } from 'node:fs';
import Database from 'better-sqlite3';
import { generateTokens } from '../../../../src/server/lib/tokens.js';
import {
  votingRetract,
  votingVote,
} from '../../../../src/server/routes/voting-vote.js';

const schema = readFileSync(
  new URL('../../../../resources/schema.sql', import.meta.url),
  'utf8'
);

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Vary: 'Origin',
};

export const makeDatabase = (): AppDatabase => {
  const db = new Database(':memory:');
  db.exec(schema);

  const database: AppDatabase = {
    prepare: (sql: string) => ({
      bind: (...values: unknown[]) => ({
        run: async () => db.prepare(sql).run(...values),
        all: async <T>() => ({
          results: db.prepare(sql).all(...values) as T[],
        }),
      }),
    }),
  };

  return database;
};

export const makeValidBody = (overrides: Record<string, unknown> = {}) => ({
  talk_id: 1,
  ...overrides,
});

export const makeRequest = (
  body: unknown,
  init: { method?: string; headers?: Record<string, string>; raw?: string } = {}
): Request =>
  new Request('http://localhost/api/voting/vote', {
    method: init.method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    body: init.raw ?? JSON.stringify(body),
  });

export const seedSpeakerAndTalk = async (database: AppDatabase) => {
  await database
    .prepare(
      `INSERT INTO speakers (name, email, phone, city, state, travel_pref, experience, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      'Speaker',
      'speaker@example.com',
      '11999999999',
      'São Paulo',
      'SP',
      0,
      2,
      'Bio'
    )
    .run();

  await database
    .prepare(
      `INSERT INTO talks (speaker_id, duration, title, description, audience_level, reason, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(1, 0, 'Talk Title', 'Description', 1, 'Reason', 2)
    .run();
};

export const noopSender: CodeSender = {
  sendCode: async () => {},
};

const TEST_SECRET = 'test-secret-32-chars-minimum-here';

const mockEnv = (database: AppDatabase): Env => ({
  DB: database,
  STRIPE_SECRET_KEY: 'test_key',
  STRIPE_WEBHOOK_SECRET: 'test_secret',
  ADMIN_KEY: 'test_admin',
  JWT_SECRET: TEST_SECRET,
});

export const createAuthHeader = async (userId: number, email: string) => {
  const { access_token } = await generateTokens(
    { id: userId, email },
    TEST_SECRET
  );
  return `Bearer ${access_token}`;
};

export const route = (
  request: Request,
  database: AppDatabase
): Promise<Response> => {
  const env = mockEnv(database);
  return request.method === 'DELETE'
    ? votingRetract({ request, cors, database, env, sender: noopSender })
    : votingVote({ request, cors, database, env, sender: noopSender });
};
