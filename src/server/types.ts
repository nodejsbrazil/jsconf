import type { z } from 'zod';
import type { BodySchema } from './schema.js';

export interface WaitlistDB {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>;
    };
  };
}

export interface Env {
  DB: WaitlistDB;
  ALLOWED_ORIGIN?: string;
}

export type WaitlistBody = z.infer<typeof BodySchema>;
