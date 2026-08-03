import type { Database, Env } from '../types.js';
import {
  EVENT_SLUG,
  MANAGER_SCOPE,
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
  managerAccessToken,
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

// Marks a dev-only manager-capture login so the callback shows the refresh token once instead of
// signing a voting session.
const MANAGER_CAPTURE_COOKIE = 'vote_manager_capture';

export const authLogin = async ({
  request,
  env,
}: Options): Promise<Response> => {
  const url = new URL(request.url);
  // Fail closed: dev-only login paths are honored only when ENVIRONMENT is explicitly 'development'.
  const dev = env.ENVIRONMENT === 'development';

  // Dev-only UI login (opt-in via ?dev=1) — signs a session for a fixed user so the
  // /vote UI is testable without a live guild.host token exchange. Never honored in production.
  if (dev && url.searchParams.has('dev') && env.SESSION_SECRET) {
    const session = await signSession(
      'dev-user',
      3,
      env.SESSION_SECRET,
      SESSION_TTL_SECONDS,
      { name: 'Dev User' }
    );
    return redirect(`${websiteOrigin(request, env)}/vote`, [
      `${SESSION_COOKIE}=${session}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${SESSION_TTL_SECONDS}`,
    ]);
  }

  if (!env.GUILD_OAUTH_CLIENT_ID)
    return new Response('OAuth not configured.', { status: 500 });

  const state = randomState();

  // Dev-only one-time capture (opt-in via ?manager=1) — requests the attendee-read scope
  // and flags the callback to display the refresh token instead of signing a session.
  const manager = dev && url.searchParams.has('manager');
  const cookies = [
    `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/vote; Max-Age=600`,
  ];
  if (manager)
    cookies.push(
      `${MANAGER_CAPTURE_COOKIE}=1; HttpOnly; Secure; SameSite=Lax; Path=/api/vote; Max-Age=600`
    );

  const authorizeUrl = buildAuthorizeUrl(
    env.GUILD_OAUTH_CLIENT_ID,
    redirectUri(request, env),
    state,
    manager ? MANAGER_SCOPE : undefined
  );
  return redirect(authorizeUrl, cookies);
};

// Returns the logged-in voter's guild.host user id, for the account page and the navbar.
// Anonymous is a normal answer here, not an error: this runs on every page load, so a 401
// would have every visitor's console logging a failed request. Callers branch on
// `authenticated`, never on the status code.
export const authMe = async ({
  request,
  env,
  cors,
}: MeOptions): Promise<Response> => {
  const session = await getSession(request, env);
  if (!session) return response({ authenticated: false }, 200, cors);
  return response(
    {
      authenticated: true,
      userId: session.userId,
      name: session.name,
      photo: session.photo,
    },
    200,
    cors
  );
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

  // On any failure the user is bounced to the site home with an ?error= code; a global handler
  // there surfaces the message. Only a clean login lands them on /vote.
  if (params.get('error')) return redirect(`${site}/?error=denied`);

  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state || state !== readCookie(request, STATE_COOKIE))
    return redirect(`${site}/?error=state`);

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
  if (!tokens) return redirect(`${site}/?error=token`);

  // Dev-only manager capture — show the refresh token once so it can be copied into
  // GUILD_ORG_REFRESH_TOKEN, then remove the ?manager=1 path. Never signs a session.
  if (
    env.ENVIRONMENT === 'development' &&
    readCookie(request, MANAGER_CAPTURE_COOKIE)
  ) {
    const body = tokens.refresh_token
      ? `GUILD_ORG_REFRESH_TOKEN=${tokens.refresh_token}\n\nCopy the value into .dev.vars, tell me, then I remove this capture path.`
      : 'guild returned no refresh_token.';
    // no-store: the body carries a refresh token, so it must never be cached. Clear both the capture
    // and state cookies with the same attributes they were set with so browsers actually drop them.
    const headers = new Headers({
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    headers.append(
      'Set-Cookie',
      `${MANAGER_CAPTURE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/api/vote; Max-Age=0`
    );
    headers.append(
      'Set-Cookie',
      `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/api/vote; Max-Age=0`
    );
    return new Response(body, { status: 200, headers });
  }

  const identity = await fetchUserInfo(tokens.access_token);
  if (!identity) return redirect(`${site}/?error=identity`);

  // The tier lives on the event attendees list, which only a manager token can read. Mint one from
  // the org refresh token, then join the attendee to this voter by id. No tier → not an attendee.
  if (!env.GUILD_ORG_REFRESH_TOKEN)
    return new Response('Manager token not configured.', { status: 500 });
  const managerToken = await managerAccessToken(
    env.GUILD_OAUTH_CLIENT_ID,
    env.GUILD_OAUTH_CLIENT_SECRET,
    env.GUILD_ORG_REFRESH_TOKEN,
    database
  );
  // A manager-token failure is an org-auth/config problem, not the voter's identity — use ?error=token.
  if (!managerToken) return redirect(`${site}/?error=token`);

  const tier = await fetchTicketTier(managerToken, EVENT_SLUG, identity.id);
  if (!tier) return redirect(`${site}/?error=notattendee`);
  const budget = await vote(database).budgetForTier(tier);

  const session = await signSession(
    identity.id,
    budget,
    env.SESSION_SECRET,
    SESSION_TTL_SECONDS,
    { name: identity.name, photo: identity.photo }
  );
  // Session cookie is SameSite=None;Secure so it's sent on the website's
  // cross-origin fetch to the API subdomain. Both must be HTTPS.
  return redirect(`${site}/vote`, [
    `${SESSION_COOKIE}=${session}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${SESSION_TTL_SECONDS}`,
    `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/api/vote; Max-Age=0`,
  ]);
};
