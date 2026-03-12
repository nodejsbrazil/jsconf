import { z } from 'zod';

export const BodySchema = z.object({
  email: z.email(),
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

export type WaitlistBody = z.infer<typeof BodySchema>;
