import type { Database, Env } from '../types.js';
import {
  EVENT_SLUG,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  STATE_COOKIE,
} from '../configs/oauth.js';
import { readCookie } from '../helpers/cookies.js';
import {
  buildAuthorizeUrl,
  exchangeCode,
  fetchTicketTier,
  fetchUserInfo,
} from '../helpers/oauth.js';
import { response } from '../helpers/response.js';
import { getSession, signSession } from '../helpers/session.js';
import { vote } from '../repositories/vote.js';

type Options = { request: Request; env: Env };
type CallbackOptions = Options & { database: Database };
type MeOptions = Options & { cors: Record<string, string> };

const randomState = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

const redirectUri = (request: Request, env: Env): string =>
  env.GUILD_OAUTH_REDIRECT_URI ??
  `${new URL(request.url).origin}/api/vote/callback`;

const websiteOrigin = (request: Request, env: Env): string =>
  env.ALLOWED_ORIGIN ?? new URL(request.url).origin;

const redirect = (location: string, cookies: string[] = []): Response => {
  const headers = new Headers({ Location: location });
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return new Response(null, { status: 302, headers });
};

export const authLogin = async ({
  request,
  env,
}: Options): Promise<Response> => {
  if (!env.GUILD_OAUTH_CLIENT_ID)
    return new Response('OAuth not configured.', { status: 500 });

  const state = randomState();
  const url = buildAuthorizeUrl(
    env.GUILD_OAUTH_CLIENT_ID,
    redirectUri(request, env),
    state
  );
  // ponytail: state cookie is Lax — it rides the top-level redirect back to /api/vote/callback.
  return redirect(url, [
    `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/vote; Max-Age=600`,
  ]);
};

// Returns the logged-in voter's guild.host user id, for the account page. 401 when unauthenticated.
export const authMe = async ({
  request,
  env,
  cors,
}: MeOptions): Promise<Response> => {
  const session = await getSession(request, env);
  if (!session) return response({ error: 'Unauthorized.' }, 401, cors);
  return response({ userId: session.userId }, 200, cors);
};

export const authLogout = async ({
  request,
  env,
}: Options): Promise<Response> => {
  // Clear the session cookie. Attributes must match the ones it was set with (Path=/,
  // SameSite=None; Secure) so the browser actually drops it.
  return redirect(`${websiteOrigin(request, env)}/vote`, [
    `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0`,
  ]);
};

export const authCallback = async ({
  request,
  env,
  database,
}: CallbackOptions): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const site = websiteOrigin(request, env);

  if (params.get('error')) return redirect(`${site}/vote?error=denied`);

  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state || state !== readCookie(request, STATE_COOKIE))
    return redirect(`${site}/vote?error=state`);

  if (
    !env.GUILD_OAUTH_CLIENT_ID ||
    !env.GUILD_OAUTH_CLIENT_SECRET ||
    !env.SESSION_SECRET
  )
    return new Response('OAuth not configured.', { status: 500 });

  const tokens = await exchangeCode(
    code,
    env.GUILD_OAUTH_CLIENT_ID,
    env.GUILD_OAUTH_CLIENT_SECRET,
    redirectUri(request, env)
  );
  if (!tokens) return redirect(`${site}/vote?error=token`);

  const userId = await fetchUserInfo(tokens.access_token);
  if (!userId) return redirect(`${site}/vote?error=identity`);

  // The voter's own token reads their ticket; no ticket → not an attendee, no session.
  const tier = await fetchTicketTier(tokens.access_token, EVENT_SLUG);
  if (!tier) return redirect(`${site}/vote?error=notattendee`);
  const budget = await vote(database).budgetForTier(tier);

  const session = await signSession(userId, budget, env.SESSION_SECRET);
  // ponytail: session cookie is SameSite=None;Secure so it's sent on the website's
  // cross-origin fetch to the API subdomain. Both must be HTTPS.
  return redirect(`${site}/vote`, [
    `${SESSION_COOKIE}=${session}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${SESSION_TTL_SECONDS}`,
    `${STATE_COOKIE}=; Max-Age=0; Path=/api/vote`,
  ]);
};
