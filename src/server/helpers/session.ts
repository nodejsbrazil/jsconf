import type { Env } from '../types.js';
import { jwtVerify, SignJWT } from 'jose';
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from '../configs/oauth.js';
import { readCookie } from './cookies.js';

const key = (secret: string): Uint8Array => new TextEncoder().encode(secret);

export const signSession = async (
  userId: string,
  secret: string,
  ttlSeconds: number = SESSION_TTL_SECONDS
): Promise<string> =>
  new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(key(secret));

export const verifySession = async (
  token: string,
  secret: string
): Promise<string | null> => {
  try {
    const { payload } = await jwtVerify(token, key(secret), {
      algorithms: ['HS256'],
    });
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
};

// Resolves the voter's id from the signed session cookie. In non-production an X-Dev-User
// header is accepted as a fallback so the endpoints are testable without the OAuth round-trip.
export const getUserId = async (
  request: Request,
  env: Env
): Promise<string | null> => {
  const cookie = readCookie(request, SESSION_COOKIE);
  if (cookie && env.SESSION_SECRET) {
    const userId = await verifySession(cookie, env.SESSION_SECRET);
    if (userId) return userId;
  }
  // ponytail: dev-only header bypass. Never honored in production.
  if (env.ENVIRONMENT !== 'production')
    return request.headers.get('X-Dev-User');
  return null;
};
