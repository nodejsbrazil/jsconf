import type { CodeSender } from '../../../../src/server/code-sender.js';
import type {
  Database as AppDatabase,
  Env,
} from '../../../../src/server/types.js';
import { readFileSync } from 'node:fs';
import Database from 'better-sqlite3';
import { votingState } from '../../../../src/server/routes/voting-state.js';

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

export const makeRequest = (
  init: { headers?: Record<string, string> } = {}
): Request =>
  new Request('http://localhost/api/voting/state', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

export const noopSender: CodeSender = {
  sendCode: async () => {},
};

const mockEnv = (database: AppDatabase): Env => ({
  DB: database,
  STRIPE_SECRET_KEY: 'test_key',
  STRIPE_WEBHOOK_SECRET: 'test_secret',
  ADMIN_KEY: 'test_admin',
  JWT_SECRET: 'test-secret-32-chars-minimum-here',
});

export const route = (
  request: Request,
  database: AppDatabase
): Promise<Response> => {
  const env = mockEnv(database);
  return votingState({ request, cors, database, env, sender: noopSender });
};
