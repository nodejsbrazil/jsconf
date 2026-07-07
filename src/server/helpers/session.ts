import type { Env } from '../types.js';
import { jwtVerify, SignJWT } from 'jose';
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from '../configs/oauth.js';
import { readCookie } from './cookies.js';

// ponytail: dev-only budget for the X-Dev-User bypass so local voting works without a login.
const DEV_BUDGET = 3;

export type Session = { userId: string; budget: number };

const key = (secret: string): Uint8Array => new TextEncoder().encode(secret);

export const signSession = async (
  userId: string,
  budget: number,
  secret: string,
  ttlSeconds: number = SESSION_TTL_SECONDS
): Promise<string> =>
  new SignJWT({ budget })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(key(secret));

export const verifySession = async (
  token: string,
  secret: string
): Promise<Session | null> => {
  try {
    const { payload } = await jwtVerify(token, key(secret), {
      algorithms: ['HS256'],
    });
    const budget = payload['budget'];
    if (typeof payload.sub !== 'string' || typeof budget !== 'number')
      return null;
    return { userId: payload.sub, budget };
  } catch {
    return null;
  }
};

// Resolves the voter's session from the signed cookie. Budget is baked into the JWT at login
// (from their own ticket tier), so no per-request guild call. In non-production an X-Dev-User
// header is accepted as a fallback (with a default budget) so the endpoints are testable
// without the OAuth round-trip.
export const getSession = async (
  request: Request,
  env: Env
): Promise<Session | null> => {
  const cookie = readCookie(request, SESSION_COOKIE);
  if (cookie && env.SESSION_SECRET) {
    const session = await verifySession(cookie, env.SESSION_SECRET);
    if (session) return session;
  }
  // ponytail: dev-only header bypass. Never honored in production.
  if (env.ENVIRONMENT !== 'production') {
    const devUser = request.headers.get('X-Dev-User');
    if (devUser) return { userId: devUser, budget: DEV_BUDGET };
  }
  return null;
};
