import type { Env } from './types.js';
import { createLoggingCodeSender } from './code-sender.js';
import { checkRateLimit, getRateLimitKey } from './configs/rate-limit.js';
import { hash } from './helpers/hash.js';
import { response } from './helpers/response.js';
import { routes } from './routes.js';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN || '*';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      Vary: 'Origin',
    };

    const { method } = request;
    if (method === 'OPTIONS')
      return new Response(null, { status: 204, headers: cors });

    const { pathname } = new URL(request.url);

    if (`${method} ${pathname}` === 'POST /api/stripe/webhook')
      return routes.stripeWebhook({ request, cors, env, database: env.DB });

    if (env.ENVIRONMENT === 'production') {
      const rateLimit = checkRateLimit(request);
      if (!rateLimit.allowed)
        return response({ error: 'Rate limit exceeded.' }, 429, {
          ...cors,
          'Retry-After': String(rateLimit.retryAfterSeconds),
        });
    }

    const votingContext = {
      request,
      cors,
      database: env.DB,
      env,
      sender: createLoggingCodeSender(),
    };

    // Routes
    switch (`${method} ${pathname}`) {
      case 'POST /api/c4p': {
        const ip = await hash(getRateLimitKey(request));
        return routes.c4p({ ...votingContext, ip });
      }
      case 'POST /api/waitlist': {
        const ip = await hash(getRateLimitKey(request));
        return routes.waitlist({ ...votingContext, ip });
      }
      case 'POST /api/users/batch':
        return routes.usersBatch(votingContext);
      case 'POST /api/auth/login':
        return routes.login(votingContext);
      case 'POST /api/auth/refresh':
        return routes.refresh(votingContext);
      case 'POST /api/auth/logout':
        return routes.logout(votingContext);
      case 'GET /api/voting/state':
        return routes.votingState(votingContext);
      case 'POST /api/voting/vote':
        return routes.votingVote(votingContext);
      case 'DELETE /api/voting/vote':
        return routes.votingRetract(votingContext);
      case 'POST /api/auth/request-code':
        return routes.requestCode(votingContext);
      default:
        return response({ error: 'Not found.' }, 404, cors);
    }
  },
} satisfies ExportedHandler<Env>;
