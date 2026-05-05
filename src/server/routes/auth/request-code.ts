import type { RouteContext } from '../types.js';
import { setTimeout as wait } from 'node:timers/promises';
import { z } from 'zod';
import { parseRequest } from '../../helpers/request.js';
import { response } from '../../helpers/response.js';
import { user } from '../../repositories/user.js';

export const requestCodeSchema = z.object({
  email: z.email(),
});

export const requestCode = async (ctx: RouteContext) => {
  const parsed = await parseRequest(ctx.request, requestCodeSchema, ctx.cors);
  if (parsed instanceof Response) return parsed;

  const { email } = parsed;

  const usersRepo = user(ctx.database);
  const [u] = await Promise.all([usersRepo.findByEmail(email), wait(100)]);

  if (!u) {
    console.warn(`[requestCode] No user found for email: ${email}`);
    return response({ success: true }, 200, ctx.cors);
  }

  const sender = ctx.sender;
  await sender.sendCode(u.email, u.code);

  return response({ success: true }, 200, ctx.cors);
};
