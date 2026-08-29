import type { Database, Env } from '../../../src/server/types.js';
import { assert, describe, it } from 'poku';
import { routes } from '../../../src/server/routes.js';

const cors = { 'Access-Control-Allow-Origin': '*' };

type Vote = { user_id: string; talk_id: number; created_at: string };
type RosterRow = {
  user_id: string;
  name: string | null;
  tier: string | null;
  synced_at: number;
};

// D1 stand-in that also models attendee_roster, so the cache path can be exercised without a
// network stub deciding the outcome.
const makeMock = (votes: Vote[], roster: RosterRow[] = []) => {
  const rosterRows = [...roster];
  const database: Database = {
    prepare: (sql: string) => ({
      bind: (...values: unknown[]) => ({
        run: async () => {
          if (sql.includes('INTO attendee_roster')) {
            const [user_id, name, tier, synced_at] = values as [
              string,
              string | null,
              string | null,
              number,
            ];
            const existing = rosterRows.findIndex((r) => r.user_id === user_id);
            const row = { user_id, name, tier, synced_at };
            if (existing >= 0) rosterRows[existing] = row;
            else rosterRows.push(row);
          }
        },
        all: async <T>() => {
          if (sql.includes('FROM attendee_roster'))
            return { results: rosterRows as T[] };
          if (sql.includes('ticket_tiers'))
            return {
              results: [{ name: 'Super Early Bird', budget: 5 }] as T[],
            };
          if (sql.includes('ROW_NUMBER()')) {
            const mine = votes
              .filter((v) => v.user_id === values[0] || v.talk_id === values[0])
              .map((v, i) => ({
                ...v,
                position: i + 1,
                title: `Talk ${v.talk_id}`,
              }));
            return { results: mine as T[] };
          }
          return { results: [] as T[] };
        },
      }),
    }),
  };
  return { database, rosterRows };
};

const env = (): Env =>
  ({
    ENVIRONMENT: 'development',
    GUILD_OAUTH_CLIENT_ID: 'id',
    GUILD_OAUTH_CLIENT_SECRET: 'secret',
    GUILD_ORG_REFRESH_TOKEN: 'refresh',
  }) as Env;

const adminReq = (url: string): Request =>
  new Request(`http://localhost${url}`, {
    headers: { 'X-Dev-User': 'organizer-1', 'X-Dev-Admin': '1' },
  });

// Counts guild attendee-page requests so "did we walk?" is directly observable.
const stubGuild = (attendees: unknown[]): (() => number) => {
  const original = globalThis.fetch;
  let walks = 0;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/oauth/token'))
      return new Response(
        JSON.stringify({ access_token: 'manager', expires_in: 3600 }),
        { status: 200 }
      );
    if (url.includes('/attendees')) {
      walks += 1;
      return new Response(
        JSON.stringify({
          edges: attendees.map((node) => ({ node })),
          pageInfo: { hasNextPage: false, endCursor: null },
        }),
        { status: 200 }
      );
    }
    return new Response('{}', { status: 404 });
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
    return walks;
  };
};

const attendee = (
  userId: string,
  first: string,
  last: string,
  tier: string
) => ({
  userId,
  user: { firstName: first, lastName: last },
  ticketOrder: {
    eventTicketOrderItems: { nodes: [{ eventTicketingTier: { name: tier } }] },
  },
});

const now = () => Math.floor(Date.now() / 1000);

describe('admin roster cache', async () => {
  // The whole point of the cache: an 11-second walk must not run on every drill-down.
  await it('serves a fresh cached roster without calling guild at all', async () => {
    const { database } = makeMock(
      [{ user_id: 'u1', talk_id: 1, created_at: '2026-08-01 10:00:00' }],
      [
        {
          user_id: 'u1',
          name: 'Ada Lovelace',
          tier: 'Super Early Bird',
          synced_at: now(),
        },
      ]
    );
    const restore = stubGuild([]);
    const res = await routes.adminVoteDetail({
      request: adminReq('/api/admin/votes/detail?talkId=1'),
      cors,
      database,
      env: env(),
    });
    const walks = restore();

    assert.equal(res.status, 200);
    assert.equal(walks, 0);
    const body = (await res.json()) as { votes: { name: string }[] };
    assert.equal(body.votes[0]?.name, 'Ada Lovelace');
  });

  await it('walks guild and persists the roster when the cache is empty', async () => {
    const { database, rosterRows } = makeMock([
      { user_id: 'u1', talk_id: 1, created_at: '2026-08-01 10:00:00' },
    ]);
    const restore = stubGuild([
      attendee('u1', 'Ada', 'Lovelace', 'Super Early Bird'),
    ]);
    await routes.adminVoteDetail({
      request: adminReq('/api/admin/votes/detail?talkId=1'),
      cors,
      database,
      env: env(),
    });
    const walks = restore();

    assert.equal(walks, 1);
    assert.equal(rosterRows.length, 1);
    assert.equal(rosterRows[0]?.name, 'Ada Lovelace');
  });

  // A ticket bought after the last sync would otherwise show as an unknown id until the TTL ran out.
  await it('re-walks when a voter is missing from an otherwise fresh cache', async () => {
    const { database } = makeMock(
      [{ user_id: 'newbie', talk_id: 1, created_at: '2026-08-01 10:00:00' }],
      [
        {
          user_id: 'someone-else',
          name: 'Old Row',
          tier: 'Early Bird',
          synced_at: now(),
        },
      ]
    );
    const restore = stubGuild([
      attendee('newbie', 'New', 'Voter', 'Early Bird'),
    ]);
    const res = await routes.adminVoteDetail({
      request: adminReq('/api/admin/votes/detail?talkId=1'),
      cors,
      database,
      env: env(),
    });
    const walks = restore();

    assert.equal(walks, 1);
    const body = (await res.json()) as { votes: { name: string }[] };
    assert.equal(body.votes[0]?.name, 'New Voter');
  });

  await it('re-walks once the cached roster is older than the TTL', async () => {
    const { database } = makeMock(
      [{ user_id: 'u1', talk_id: 1, created_at: '2026-08-01 10:00:00' }],
      [
        {
          user_id: 'u1',
          name: 'Stale Name',
          tier: 'Early Bird',
          synced_at: now() - 7200,
        },
      ]
    );
    const restore = stubGuild([attendee('u1', 'Fresh', 'Name', 'Early Bird')]);
    const res = await routes.adminVoteDetail({
      request: adminReq('/api/admin/votes/detail?talkId=1'),
      cors,
      database,
      env: env(),
    });
    const walks = restore();

    assert.equal(walks, 1);
    const body = (await res.json()) as { votes: { name: string }[] };
    assert.equal(body.votes[0]?.name, 'Fresh Name');
  });

  // Losing guild must not blank out names an organizer could still act on.
  await it('keeps the stale cache when the guild walk comes back empty', async () => {
    const { database } = makeMock(
      [{ user_id: 'u1', talk_id: 1, created_at: '2026-08-01 10:00:00' }],
      [
        {
          user_id: 'u1',
          name: 'Stale Name',
          tier: 'Early Bird',
          synced_at: now() - 7200,
        },
      ]
    );
    const restore = stubGuild([]);
    const res = await routes.adminVoteDetail({
      request: adminReq('/api/admin/votes/detail?talkId=1'),
      cors,
      database,
      env: env(),
    });
    restore();

    const body = (await res.json()) as {
      rosterAvailable: boolean;
      votes: { name: string }[];
    };
    assert.equal(body.rosterAvailable, true);
    assert.equal(body.votes[0]?.name, 'Stale Name');
  });
});

describe('routes.adminVoterDetail', async () => {
  await it('returns every vote from one person with their tier budget', async () => {
    const { database } = makeMock(
      [
        { user_id: 'u1', talk_id: 1, created_at: '2026-08-01 10:00:00' },
        { user_id: 'u1', talk_id: 2, created_at: '2026-08-01 10:05:00' },
      ],
      [
        {
          user_id: 'u1',
          name: 'Ada Lovelace',
          tier: 'Super Early Bird',
          synced_at: now(),
        },
      ]
    );
    const restore = stubGuild([]);
    const res = await routes.adminVoterDetail({
      request: adminReq('/api/admin/votes/voter?userId=u1'),
      cors,
      database,
      env: env(),
    });
    restore();

    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      name: string;
      tier: string;
      budget: number;
      votes: { talkId: number; position: number }[];
    };
    assert.equal(body.name, 'Ada Lovelace');
    assert.equal(body.tier, 'Super Early Bird');
    assert.equal(body.budget, 5);
    assert.equal(body.votes.length, 2);
    assert.equal(body.votes[1]?.position, 2);
  });

  await it('rejects a missing user id with 422', async () => {
    const { database } = makeMock([]);
    const res = await routes.adminVoterDetail({
      request: adminReq('/api/admin/votes/voter'),
      cors,
      database,
      env: env(),
    });
    assert.equal(res.status, 422);
  });

  await it('rejects a non-admin with 403', async () => {
    const { database } = makeMock([]);
    const res = await routes.adminVoterDetail({
      request: new Request('http://localhost/api/admin/votes/voter?userId=u1', {
        headers: { 'X-Dev-User': 'plain' },
      }),
      cors,
      database,
      env: env(),
    });
    assert.equal(res.status, 403);
  });
});
