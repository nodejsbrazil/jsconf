import type { Database } from '../types.js';
import { z } from 'zod';

export type Waitlist = ReturnType<typeof waitlist>;

export const waitlist = (database: Database) => {
  const dailyLimit = 10;

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

  const canInsert = async (ip: string): Promise<boolean> => {
    const { results } = await database
      .prepare(
        "SELECT COUNT(*) as total FROM waitlist WHERE ip = ? AND created_at >= date('now')"
      )
      .bind(ip)
      .all<{ total: number }>();

    return (results[0]?.total ?? 0) < dailyLimit;
  };

  const insert = async (
    email: string,
    utmSource: string | undefined,
    ip: string
  ): Promise<boolean> => {
    try {
      await database
        .prepare(
          'INSERT INTO waitlist (email, ip, utm_source) VALUES (?, ?, ?)'
        )
        .bind(email, ip, utmSource ?? null)
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
    canInsert,
    insert,
  };
};
