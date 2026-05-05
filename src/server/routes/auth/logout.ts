import type { RouteContext } from '../types.js';
import { z } from 'zod';
import { parseRequest } from '../../helpers/request.js';
import { response } from '../../helpers/response.js';
import { hashRefreshToken } from '../../lib/tokens.js';
import { user } from '../../repositories/user.js';

export { LogoutResponseSchema } from '../../schemas.js';

export const logoutSchema = z.object({
  refresh_token: z.string(),
});

export const logout = async (ctx: RouteContext) => {
  const { request, cors, database } = ctx;

  const parsed = await parseRequest(request, logoutSchema, cors);
  if (parsed instanceof Response) {
    return response({ error: 'invalid_refresh_token' }, 401, cors);
  }

  try {
    const usersRepo = user(database);
    const hashedToken = hashRefreshToken(parsed.refresh_token);
    const u = await usersRepo.findByRefreshTokenHash(hashedToken);
    if (!u) return response({ error: 'invalid_refresh_token' }, 401, cors);

    await usersRepo.clearRefreshToken(u.id);
    return response({ success: true }, 200, cors);
  } catch {
    return response({ error: 'Internal error' }, 500, cors);
  }
};
