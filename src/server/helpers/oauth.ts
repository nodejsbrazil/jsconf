import type { Database } from '../types.js';
import {
  AUTHORIZE_URL,
  EVENTS_BASE,
  OAUTH_SCOPE,
  TOKEN_URL,
  USERINFO_URL,
} from '../configs/oauth.js';

export const buildAuthorizeUrl = (
  clientId: string,
  redirectUri: string,
  state: string,
  scope: string = OAUTH_SCOPE
): string => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
};

export const exchangeCode = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token?: string } | null> => {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  }).catch(() => null);

  if (!res || !res.ok) return null;
  return (await res.json()) as { access_token: string; refresh_token?: string };
};

// One page of guild's event attendees. The tier lives on each attendee's paid ticket order;
// most attendees (interest-only, no ticket) have `ticketOrder: null`.
type AttendeeNode = {
  userId?: string;
  user?: { firstName?: string; lastName?: string } | null;
  ticketOrder?: {
    eventTicketOrderItems?: {
      nodes?: { eventTicketingTier?: { name?: string } | null }[];
    };
  } | null;
};

type AttendeesPage = {
  edges?: { node?: AttendeeNode }[];
  pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
};

// guild caps `first` at 20 and silently ignores anything higher, so asking for more only makes the
// page count read bigger than it is. Documented in the OpenAPI spec for this endpoint.
const PAGE_SIZE = 20;

const fetchAttendeesPage = async (
  accessToken: string,
  slug: string,
  after: string
): Promise<AttendeesPage | null> => {
  const query = after ? `&after=${encodeURIComponent(after)}` : '';
  const res = await fetch(
    `${EVENTS_BASE}/${slug}/attendees?first=${PAGE_SIZE}${query}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  ).catch(() => null);
  if (!res || !res.ok) return null;
  return (await res.json()) as AttendeesPage;
};

const nextCursor = (page: AttendeesPage): string | null =>
  page.pageInfo?.hasNextPage ? (page.pageInfo.endCursor ?? null) : null;

const tierOf = (node: AttendeeNode): string | null =>
  node.ticketOrder?.eventTicketOrderItems?.nodes?.[0]?.eventTicketingTier
    ?.name ?? null;

const nameOf = (node: AttendeeNode): string | null => {
  const full = [node.user?.firstName, node.user?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return full || null;
};

// Walk the attendees list (created_at desc) to find this user's ticket tier. Recursive so it pages
// without a `let` cursor. Capped at `pagesLeft` pages so a huge attendee list can't hang a login;
// a fresh voter sorts near the top, so page 1 usually hits.
const attendeeTier = async (
  accessToken: string,
  slug: string,
  userId: string,
  after: string,
  pagesLeft: number
): Promise<string | null> => {
  if (pagesLeft <= 0) return null;
  const page = await fetchAttendeesPage(accessToken, slug, after);
  if (!page) return null;
  const node = page.edges?.find((edge) => edge.node?.userId === userId)?.node;
  if (node) return tierOf(node);
  const next = nextCursor(page);
  if (!next) return null;
  return attendeeTier(accessToken, slug, userId, next, pagesLeft - 1);
};

// 150 pages of 20 = 3000 attendees. The old code asked for 100/page over 30 pages, which guild
// capped to 20, so it really only reached 600; this restores the coverage the numbers implied.
export const fetchTicketTier = async (
  accessToken: string,
  slug: string,
  userId: string
): Promise<string | null> => attendeeTier(accessToken, slug, userId, '', 150);

// The admin check. guild answers this endpoint only for users who can manage the event and returns
// 403 for everyone else, so a 200 with the voter's OWN token is proof they are an organizer.
// `first=1` keeps it to the smallest possible page.
export const canManageEvent = async (
  accessToken: string,
  slug: string
): Promise<boolean> => {
  const res = await fetch(`${EVENTS_BASE}/${slug}/attendees?first=1`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => null);
  return Boolean(res?.ok);
};

export type Attendee = { name: string | null; tier: string | null };

// Every attendee, keyed by guild user id, for the dashboard's id -> name/tier join. `c4p_votes`
// stores only the user id, so this list is the only place the name and tier exist.
// ponytail: walked live on each request, 20 attendees per call. If the event outgrows that,
// cache the roster in a D1 table and refresh it on a TTL instead of adding pages here.
const rosterPage = async (
  accessToken: string,
  slug: string,
  after: string,
  pagesLeft: number,
  into: Map<string, Attendee>
): Promise<Map<string, Attendee>> => {
  if (pagesLeft <= 0) return into;
  const page = await fetchAttendeesPage(accessToken, slug, after);
  if (!page) return into;
  for (const edge of page.edges ?? []) {
    const node = edge.node;
    if (!node?.userId) continue;
    into.set(node.userId, { name: nameOf(node), tier: tierOf(node) });
  }
  const next = nextCursor(page);
  if (!next) return into;
  return rosterPage(accessToken, slug, next, pagesLeft - 1, into);
};

export const fetchAttendeeRoster = async (
  accessToken: string,
  slug: string
): Promise<Map<string, Attendee>> =>
  rosterPage(accessToken, slug, '', 150, new Map());

type MintedToken = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  // The token this mint was made with, so the caller can persist it when guild returns no
  // rotated replacement.
  used: string;
};

// One refresh_token exchange. Returns null on any refusal so the caller can decide whether a
// second attempt with a different token is worth making.
const mintManagerToken = async (
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<MintedToken | null> => {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    // Logs status + error body only, never the token. Useful when guild revokes or rotates
    // unexpectedly, which is the usual reason a previously working token starts failing.
    console.log(
      '[manager] status',
      res?.status ?? 'fetch-error',
      res ? await res.text() : ''
    );
    return null;
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
  return { ...data, used: refreshToken };
};

// Manager access token used to read the attendees list. Cached in D1 (shared across worker
// instances) until it expires; guild rotates the refresh token on use, so the rotated token is
// written back here. At expiry two cold instances could race the refresh and one login would fail
// (a retry succeeds) — fine for low-traffic voting.
export const managerAccessToken = async (
  clientId: string,
  clientSecret: string,
  bootstrapRefresh: string,
  database: Database
): Promise<string | null> => {
  const now = Math.floor(Date.now() / 1000);
  const { results } = await database
    .prepare(
      'SELECT refresh_token, access_token, expires_at FROM manager_oauth WHERE id = 1'
    )
    .bind()
    .all<{
      refresh_token: string;
      access_token: string | null;
      expires_at: number;
    }>();
  const row = results[0];
  if (row?.access_token && row.expires_at - 60 > now) return row.access_token;

  const stored = row?.refresh_token;
  // Try the token D1 holds first, since guild's rotation makes it the newest one we know about.
  const fromStored = stored
    ? await mintManagerToken(stored, clientId, clientSecret)
    : null;

  // Stored token refused. That means the chain broke: someone rotated GUILD_ORG_REFRESH_TOKEN by
  // hand, or the stored one was spent elsewhere (another environment sharing the same credential).
  // Retrying with the bootstrap secret lets a rotated secret take effect on its own, instead of
  // needing the D1 row deleted manually before the new value is ever read.
  const minted =
    fromStored ??
    (stored !== bootstrapRefresh
      ? await mintManagerToken(bootstrapRefresh, clientId, clientSecret)
      : null);

  if (!minted) return null;

  // guild rotates the refresh token on use, so persist the rotated one or the next mint fails.
  await database
    .prepare(
      `INSERT INTO manager_oauth (id, refresh_token, access_token, expires_at, updated_at)
       VALUES (1, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         refresh_token = excluded.refresh_token,
         access_token = excluded.access_token,
         expires_at = excluded.expires_at,
         updated_at = datetime('now')`
    )
    .bind(
      minted.refresh_token ?? minted.used,
      minted.access_token,
      now + (minted.expires_in ?? 3600)
    )
    .run();
  return minted.access_token;
};

export const fetchUserInfo = async (
  accessToken: string
): Promise<{ id: string; name?: string; photo?: string } | null> => {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => null);

  if (!res || !res.ok) return null;
  const data = (await res.json()) as Record<string, unknown>;
  // guild.host userinfo: `sub` is the stable id (UUID), `name` the display name, `picture` the
  // avatar URL. Confirmed against a live login.
  if (typeof data['sub'] !== 'string') return null;
  return {
    id: data['sub'],
    name: typeof data['name'] === 'string' ? data['name'] : undefined,
    photo: typeof data['picture'] === 'string' ? data['picture'] : undefined,
  };
};
