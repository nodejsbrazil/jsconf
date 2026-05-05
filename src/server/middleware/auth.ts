import type { Database, Env } from '../types.js';
import { response } from '../helpers/response.js';
import { validateAccessToken } from '../lib/tokens.js';
import { user } from '../repositories/user.js';

export async function requireAuth(
  request: Request,
  env: Env,
  database: Database,
  cors?: Record<string, string>
): Promise<
  | {
      user: {
        id: number;
        email: string;
        ticket_type: number;
        votes_allowed: number;
        quantity: number;
      };
      request: Request;
    }
  | Response
> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    if (cors) {
      return response({ error: 'unauthorized' }, 401, cors);
    }
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.slice(7);
  let payload: { sub: string; email: string };
  try {
    payload = await validateAccessToken(token, env.JWT_SECRET);
  } catch {
    if (cors) {
      return response({ error: 'unauthorized' }, 401, cors);
    }
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const usersRepo = user(database);
  const u = await usersRepo.findById(Number(payload.sub));
  if (!u) {
    if (cors) {
      return response({ error: 'unauthorized' }, 401, cors);
    }
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return { user: u, request };
}
