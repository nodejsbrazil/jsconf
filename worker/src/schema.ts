import { z } from 'zod';

export const BodySchema = z.object({
  email: z.email(),
  /** Honeypot field — real users never fill this; any non-empty value means a bot */
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
      z.literal('other'),
    ])
    .optional(),
});

export type WaitlistBody = z.infer<typeof BodySchema>;
