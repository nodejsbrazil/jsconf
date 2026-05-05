import { z } from 'zod';

// --- Response schemas (shared across routes) ---

export const UserSchema = z.object({
  id: z.number(),
  email: z.string(),
  ticket_type: z.number(),
  votes_allowed: z.number(),
  votes_remaining: z.number(),
  quantity: z.number(),
  code: z.string(),
});

export const TalkSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  speaker_name: z.string(),
  duration: z.number(),
  audience_level: z.number(),
});

export const VotingAuthResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
  }),
});

export const VotingAuthUserOnlySchema = z.object({
  user: z.object({
    id: z.number(),
    email: z.string(),
    votes_remaining: z.number(),
  }),
  talks: z.array(TalkSchema),
});

export const UsersBatchResultItemSchema = z.object({
  email: z.string(),
  code: z.string(),
});

export const UsersBatchResultSchema = z.object({
  results: z.array(UsersBatchResultItemSchema),
});

export const UsersBatchUpsertResultSchema = UsersBatchResultSchema;

export const VotesRemainingResponseSchema = z.object({
  votes_remaining: z.number(),
});

export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string(),
});

export const RefreshTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
  }),
});

export const VotingStateResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    email: z.string(),
    votes_remaining: z.number(),
  }),
  talks: z.array(TalkSchema),
  votedTalkIds: z.array(z.number()),
});

export const LogoutRequestSchema = z.object({
  refresh_token: z.string(),
});

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
});
