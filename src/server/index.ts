import type { Env } from './types.js';
import { checkRateLimit, getRateLimitKey } from './configs/rate-limit.js';
import { hash } from './helpers/hash.js';
import { response } from './helpers/response.js';
import { routes } from './routes.js';

export default {
  // `ctx` is here only so the dashboard summary can warm the attendee roster with
  // `ctx.waitUntil()`: the walk keeps running after the response is sent, instead of the organizer
  // waiting through it on their first drill-down click.
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN || '*';
    const cors: Record<string, string> = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      // Session-derived bodies (votes, identity) must never be stored by browsers or proxies.
      'Cache-Control': 'no-store',
      Vary: 'Origin',
    };
    // Credentialed requests (vote session cookie) need an explicit origin, never '*'.
    if (origin !== '*') cors['Access-Control-Allow-Credentials'] = 'true';

    const { method } = request;
    if (method === 'OPTIONS')
      return new Response(null, { status: 204, headers: cors });

    const { pathname } = new URL(request.url);

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
        return routes.c4p({ request, cors, database: env.DB, ip });
      case 'GET /api/vote/login':
        return routes.authLogin({ request, env });
      case 'GET /api/vote/me':
        return routes.authMe({ request, cors, env });
      case 'GET /api/vote/logout':
        return routes.authLogout({ request, env });
      case 'GET /api/vote/callback':
        return routes.authCallback({ request, env, database: env.DB });
      case 'GET /api/vote':
        return routes.voteGet({ request, cors, database: env.DB, env });
      case 'POST /api/vote':
        return routes.voteSubmit({ request, cors, database: env.DB, env });
      case 'GET /api/admin/votes':
        return routes.adminVotes({ request, cors, database: env.DB, env, ctx });
      case 'GET /api/admin/votes/detail':
        return routes.adminVoteDetail({ request, cors, database: env.DB, env });
      case 'POST /api/admin/votes/remove':
        return routes.adminRemoveVote({ request, cors, database: env.DB, env });
      case 'GET /api/admin/votes/voter':
        return routes.adminVoterDetail({
          request,
          cors,
          database: env.DB,
          env,
        });
      case 'GET /api/admin/audit':
        return routes.adminAudit({ request, cors, database: env.DB, env });
      case 'POST /api/waitlist':
        return routes.waitlist({ request, cors, database: env.DB, ip });
      default:
        return response({ error: 'Not found.' }, 404, cors);
    }
  },
} satisfies ExportedHandler<Env>;
