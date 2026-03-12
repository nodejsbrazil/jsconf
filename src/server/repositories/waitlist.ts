import type { Database } from '../types.js';
import { z } from 'zod';

export type Waitlist = ReturnType<typeof waitlist>;

export const waitlist = (database: Database) => {
  const schema = z.object({
    email: z.email().max(254),
    website: z.string().default(''),
    utmSource: z
      .union([
        z.literal('google'),
        z.literal('facebook'),
        z.literal('x'),
        z.literal('twitter'),
        z.literal('linkedin'),
        z.literal('github'),
        z.literal('instagram'),
        z.literal('bluesky'),
        z.literal('slack'),
        z.literal('newsletter'),
      ])
      .optional(),
  });

  const insert = async (
    email: string,
    utmSource?: string
  ): Promise<boolean> => {
    try {
      await database
        .prepare('INSERT INTO waitlist (email, utm_source) VALUES (?, ?)')
        .bind(email, utmSource ?? null)
        .run();

      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE'))
        return true;

      return false;
    }
  };

  return {
    schema,
    insert,
  };
};
