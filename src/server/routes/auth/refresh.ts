import type { RouteContext } from '../types.js';
import { z } from 'zod';
import { parseRequest } from '../../helpers/request.js';
import { response } from '../../helpers/response.js';
import { generateTokens, hashRefreshToken } from '../../lib/tokens.js';
import { user } from '../../repositories/user.js';

export { RefreshTokenResponseSchema } from '../../schemas.js';

export const refreshTokenSchema = z.object({
  refresh_token: z.string(),
});

export const refresh = async (ctx: RouteContext) => {
  const { request, cors, database, env } = ctx;

  const parsed = await parseRequest(request, refreshTokenSchema, cors);
  if (parsed instanceof Response) {
    return response({ error: 'invalid_refresh_token' }, 401, cors);
  }

  try {
    const usersRepo = user(database);
    const hashedToken = hashRefreshToken(parsed.refresh_token);
    const u = await usersRepo.findByRefreshTokenHash(hashedToken);
    if (!u) return response({ error: 'invalid_refresh_token' }, 401, cors);

    const tokens = await generateTokens(
      { id: u.id, email: u.email },
      env.JWT_SECRET
    );
    const newHash = hashRefreshToken(tokens.refresh_token);
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    await usersRepo.setRefreshToken(u.email, newHash, expiresAt);

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
