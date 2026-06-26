import type { Env } from '../types.js';
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from '../configs/oauth.js';

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const fromBase64Url = (text: string): Uint8Array => {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  return Uint8Array.from(bin, (char) => char.charCodeAt(0));
};

const key = (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );

export const signSession = async (
  userId: string,
  secret: string,
  ttlSeconds: number = SESSION_TTL_SECONDS
): Promise<string> => {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ sub: userId, exp }))
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    await key(secret),
    encoder.encode(payload)
  );
  return `${payload}.${toBase64Url(new Uint8Array(sig))}`;
};

export const verifySession = async (
  token: string,
  secret: string
): Promise<string | null> => {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;

  const valid = await crypto.subtle.verify(
    'HMAC',
    await key(secret),
    fromBase64Url(sig) as BufferSource,
    encoder.encode(payload)
  );
  if (!valid) return null;

  try {
    const { sub, exp } = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload))
    );
    if (typeof sub !== 'string' || typeof exp !== 'number') return null;
    if (exp < Math.floor(Date.now() / 1000)) return null;
    return sub;
  } catch {
    return null;
  }
};

const readCookie = (request: Request, name: string): string | null => {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
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
