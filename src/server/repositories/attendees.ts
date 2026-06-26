import type { Database, Env } from '../types.js';
import { createLRU } from 'lru.min';
import { ATTENDEES_BASE, EVENT_SLUG } from '../configs/oauth.js';
import { getOrgAccessToken } from './oauth-token.js';

// Cached userId -> tier name map, keyed by event slug. Refetched after TTL.
// ponytail: per-isolate in-memory cache, same tradeoff as the rate limiter. Many isolates
// each refetch on a cold miss; fine for a vote window with a few hundred attendees.
const TTL_MS = 5 * 60_000;
const cache = createLRU<string, { at: number; map: Record<string, string> }>({
  max: 8,
});

type Attendee = {
  status?: string;
  paymentStatus?: string | null;
  user?: { id?: string; rowId?: string; slugId?: string } | null;
  ticketOrder?: {
    eventTicketOrderItems?: {
      nodes?: { eventTicketingTier?: { name?: string } | null }[];
    };
  } | null;
};

const isConfirmed = (a: Attendee): boolean =>
  a.status !== 'CANCELLED' && a.paymentStatus !== 'FAILED';

const tierOf = (a: Attendee): string | undefined =>
  a.ticketOrder?.eventTicketOrderItems?.nodes?.[0]?.eventTicketingTier?.name;

const fetchTierMap = async (token: string): Promise<Record<string, string>> => {
  const map: Record<string, string> = {};
  let after: string | null = null;

  do {
    const url = new URL(`${ATTENDEES_BASE}/${EVENT_SLUG}/attendees`);
    url.searchParams.set('first', '100');
    if (after) url.searchParams.set('after', after);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);
    if (!res || !res.ok) break;

    const data = (await res.json()) as {
      edges?: { node?: Attendee }[];
      pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
    };

    for (const edge of data.edges ?? []) {
      const node = edge.node;
      if (!node || !isConfirmed(node)) continue;
      const tier = tierOf(node);
      if (!tier) continue;
      // Map every id variant so the lookup matches whatever userinfo returns.
      for (const id of [node.user?.id, node.user?.rowId, node.user?.slugId])
        if (id) map[id] = tier;
    }

    after = data.pageInfo?.hasNextPage
      ? (data.pageInfo.endCursor ?? null)
      : null;
  } while (after);

  return map;
};

const getTierMap = async (token: string): Promise<Record<string, string>> => {
  const hit = cache.get(EVENT_SLUG);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.map;
  const map = await fetchTierMap(token);
  cache.set(EVENT_SLUG, { at: Date.now(), map });
  return map;
};

// Returns the vote budget for a user, or null when they are not a confirmed attendee.
// An attendee on a tier missing from ticket_tiers gets 0 (can view, cannot vote).
export const resolveBudget = async (
  env: Env,
  database: Database,
  userId: string
): Promise<number | null> => {
  const token = await getOrgAccessToken(env, database);
  if (!token) return null;

  const map = await getTierMap(token);
  const tier = map[userId];
  if (!tier) return null;

  const { results } = await database
    .prepare('SELECT budget FROM ticket_tiers WHERE name = ?')
    .bind(tier)
    .all<{ budget: number }>();

  return results[0]?.budget ?? 0;
};
