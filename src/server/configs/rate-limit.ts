import { createLRU } from 'lru.min';

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000;

const cache = createLRU<string, RateLimitEntry>({ max: 1000 });

export const getRateLimitKey = (request: Request): string =>
  request.headers.get('CF-Connecting-IP') ??
  request.headers.get('X-Forwarded-For') ??
  'unknown';

export const checkRateLimit = (request: Request) => {
  const key = getRateLimitKey(request);
  const now = Date.now();
  const entry = cache.get(key);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    cache.set(key, { count: 1, windowStart: now });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  const count = entry.count + 1;

  cache.set(key, { ...entry, count });

  if (count > MAX_REQUESTS) {
    const remainingMs = WINDOW_MS - (now - entry.windowStart);

    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(remainingMs / 1000),
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
};
