import type { RouteContext } from '../types.js';
import { setTimeout as wait } from 'node:timers/promises';
import { z } from 'zod';
import { parseRequest } from '../../helpers/request.js';
import { response } from '../../helpers/response.js';
import { generateTokens, hashRefreshToken } from '../../lib/tokens.js';
import { user } from '../../repositories/user.js';

export { RefreshTokenResponseSchema } from '../../schemas.js';

export const voteSchema = z.object({
  code: z.string().length(4),
});

export const login = async (ctx: RouteContext) => {
  const { request, cors, database, env } = ctx;

  const parsed = await parseRequest(request, voteSchema, cors);
  if (parsed instanceof Response) return parsed;

  try {
    const usersRepo = user(database);

    const [u] = await Promise.all([
      usersRepo.findByCode(parsed.code),
      wait(100),
    ]);

    if (!u) return response({ error: 'User not found' }, 404, cors);

    const tokens = await generateTokens(
      { id: u.id, email: u.email },
      env.JWT_SECRET
    );
    const tokenHash = hashRefreshToken(tokens.refresh_token);
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    await usersRepo.setRefreshToken(u.email, tokenHash, expiresAt);

    return response(
      {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: u.id,
          email: u.email,
        },
      },
      200,
      cors
    );
  } catch {
    return response({ error: 'Internal error' }, 500, cors);
  }
};
