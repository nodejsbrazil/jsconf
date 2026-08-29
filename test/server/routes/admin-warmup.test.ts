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

// Opening the dashboard warms the roster in the background. The point is that the organizer never
// waits through the ~11s guild walk: the summary is pure SQL and must return immediately, with the
// walk continuing after the response via ctx.waitUntil.
describe('adminVotes roster warm-up', async () => {
  // Minimal ExecutionContext stand-in that records what was handed to waitUntil, so the test can
  // await the background work instead of racing it.
  const makeCtx = () => {
    const pending: Promise<unknown>[] = [];
    return {
      pending,
      ctx: {
        waitUntil: (promise: Promise<unknown>) => {
          pending.push(promise);
        },
        passThroughOnException: () => {},
      } as unknown as ExecutionContext,
    };
  };

  await it('walks guild in the background when the cache is cold', async () => {
    const { database, rosterRows } = makeMock([]);
    const restore = stubGuild([
      attendee('u1', 'Ada', 'Lovelace', 'Super Early Bird'),
    ]);
    const { ctx, pending } = makeCtx();

    const res = await routes.adminVotes({
      request: adminReq('/api/admin/votes'),
      cors,
      database,
      env: env(),
      ctx,
    });

    // The summary answers before the walk is done: that is the whole point.
    assert.equal(res.status, 200);
    assert.equal(pending.length, 1);

    await Promise.all(pending);
    const walks = restore();
    assert.equal(walks, 1);
    assert.equal(rosterRows.length, 1);
    assert.equal(rosterRows[0]?.name, 'Ada Lovelace');
  });

  await it('does not walk when the cached roster is still fresh', async () => {
    const { database } = makeMock(
      [],
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
    const { ctx, pending } = makeCtx();

    await routes.adminVotes({
      request: adminReq('/api/admin/votes'),
      cors,
      database,
      env: env(),
      ctx,
    });
    await Promise.all(pending);
    assert.equal(restore(), 0);
  });

  // A failing warm-up is optional work: it must never turn a working summary into an error.
  await it('still returns the summary when the warm-up rejects', async () => {
    const { database } = makeMock([]);
    const original = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new Error('guild is down');
    }) as typeof fetch;
    const { ctx, pending } = makeCtx();

    const res = await routes.adminVotes({
      request: adminReq('/api/admin/votes'),
      cors,
      database,
      env: env(),
      ctx,
    });

    // Rejecting here would show up as an unhandled rejection in the worker, so it must resolve.
    await Promise.all(pending);
    globalThis.fetch = original;
    assert.equal(res.status, 200);
  });

  // Every other admin route passes no ctx, so the guard has to tolerate that.
  await it('works without a ctx at all', async () => {
    const { database } = makeMock([]);
    const restore = stubGuild([]);
    const res = await routes.adminVotes({
      request: adminReq('/api/admin/votes'),
      cors,
      database,
      env: env(),
    });
    restore();
    assert.equal(res.status, 200);
  });
});
