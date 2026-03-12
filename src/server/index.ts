import type { Env } from './types.js';
import { checkRateLimit, getRateLimitKey } from './configs/rate-limit.js';
import { hash } from './helpers/hash.js';
import { response } from './helpers/response.js';
import { routes } from './routes.js';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN || '*';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    };

    const { method } = request;
    if (method === 'OPTIONS')
      return new Response(null, { status: 204, headers: cors });

    const rateLimit = checkRateLimit(request);
    if (!rateLimit.allowed)
      return response({ error: 'rate_limit_exceeded' }, 429, {
        ...cors,
        'Retry-After': String(rateLimit.retryAfterSeconds),
      });

    const body = await (async () => {
      try {
        return await request.json();
      } catch {
        return;
      }
    })();
    if (!body) return response({ error: 'invalid_json' }, 400, cors);

    const { pathname } = new URL(request.url);
    const ip = await hash(getRateLimitKey(request));

    // Routes
    switch (`${method} ${pathname}`) {
      case 'POST /api/waitlist':
        return routes.waitlist({ body, cors, database: env.DB, ip });
      default:
        return response({ error: 'not_found' }, 404, cors);
    }
  },
} satisfies ExportedHandler<Env>;
