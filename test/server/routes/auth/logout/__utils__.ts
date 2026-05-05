import type { CodeSender } from '../../../../../src/server/code-sender.js';
import type {
  Database as AppDatabase,
  Env,
} from '../../../../../src/server/types.js';
import { readFileSync } from 'node:fs';
import Database from 'better-sqlite3';
import { logout } from '../../../../../src/server/routes/auth/logout.js';

const schema = readFileSync(
  new URL('../../../../../resources/schema.sql', import.meta.url),
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
  body: unknown,
  init: { headers?: Record<string, string>; raw?: string } = {}
): Request =>
  new Request('http://localhost/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    body: init.raw ?? JSON.stringify(body),
  });

export const noopSender: CodeSender = {
  sendCode: async () => {},
};

const mockEnv = (database: AppDatabase, secret: string): Env => ({
  DB: database,
  STRIPE_SECRET_KEY: 'test_key',
  STRIPE_WEBHOOK_SECRET: 'test_secret',
  ADMIN_KEY: 'test_admin',
  JWT_SECRET: secret,
});

export const route = (
  request: Request,
  database: AppDatabase
): Promise<Response> => {
  const env = mockEnv(database, 'test-secret-32-chars-minimum-here');
  return logout({ request, cors, database, env, sender: noopSender });
};
