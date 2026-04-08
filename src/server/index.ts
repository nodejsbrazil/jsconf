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

    const { pathname } = new URL(request.url);

    if (`${method} ${pathname}` === 'POST /api/stripe/webhook')
      return routes.stripeWebhook({ request, cors, env });

    const rateLimit = checkRateLimit(request);
    if (!rateLimit.allowed)
      return response({ error: 'Rate limit exceeded.' }, 429, {
        ...cors,
        'Retry-After': String(rateLimit.retryAfterSeconds),
      });

    const ip = await hash(getRateLimitKey(request));

    // Routes
    switch (`${method} ${pathname}`) {
      case 'POST /api/c4p':
        return routes.c4p({
          request,
          cors,
          database: env.DB,
          encryptionKey: env.ENCRYPTION_KEY,
          ip,
        });
      case 'POST /api/waitlist':
        return routes.waitlist({ request, cors, database: env.DB, ip });
      default:
        return response({ error: 'Not found.' }, 404, cors);
    }
  },
} satisfies ExportedHandler<Env>;
