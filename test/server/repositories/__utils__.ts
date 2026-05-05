import type { Database as AppDatabase } from '../../../src/server/types.js';
import { readFileSync } from 'node:fs';
import Database from 'better-sqlite3';

const schema = readFileSync(
  new URL('../../../resources/schema.sql', import.meta.url),
  'utf8'
);

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
