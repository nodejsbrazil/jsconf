import type { RouteContext } from './types.js';
import { z } from 'zod';
import { parseRequest } from '../helpers/request.js';
import { response } from '../helpers/response.js';
import { user, userSchema } from '../repositories/user.js';

export {
  UsersBatchResultSchema,
  UsersBatchUpsertResultSchema,
} from '../schemas.js';

export const usersBatchBodySchema = z.object({
  users: z.array(userSchema).min(1),
});

export const usersBatch = async (ctx: RouteContext) => {
  const { request, cors, database, env } = ctx;

  const parsed = await parseRequest(request, usersBatchBodySchema, cors);
  if (parsed instanceof Response) return parsed;

  const adminKey = request.headers.get('ADMIN_KEY');
  if (!adminKey || adminKey !== env.ADMIN_KEY)
    return response({ error: 'Unauthorized' }, 401, cors);

  const usersRepo = user(database);
  const results = await usersRepo.insertBatch(parsed.users);
  return response({ results }, 201, cors);
};
