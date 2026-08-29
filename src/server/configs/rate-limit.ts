import { createLRU } from 'lru.min';

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

/**
 * One budget covers every endpoint, so it has to fit the chattiest legitimate caller rather than
 * the cheapest one. The admin dashboard is that caller: opening it spends two requests, each
 * drill-down one, and removing a vote three. At the old ceiling of 10 an organizer hit 429 after
 * roughly three removals, which reads as the page being broken.
 *
 * 30 leaves room for that while staying far below anything abusive on the public write endpoints:
 * the waitlist is the one worth protecting, and 30 signups a minute from a single IP is not a
 * person. Exported so the tests read the real number instead of restating it.
 */
export const MAX_REQUESTS = 30;
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
