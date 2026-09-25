import type { Database, Env } from '../../../src/server/types.js';
import { assert, describe, it } from 'poku';
import { routes } from '../../../src/server/routes.js';

const cors = { 'Access-Control-Allow-Origin': '*' };
const realFetch = globalThis.fetch;

type Vote = { user_id: string; talk_id: number; created_at: string };

// D1 stand-in that applies the summary's exclusion list the way the real query does, so the test
// checks what the organizer sees rather than the SQL text.
const makeDb = (votes: Vote[]): Database => ({
  prepare: (sql: string) => ({
    bind: (...values: unknown[]) => ({
      run: async () => {},
      all: async <T>() => {
        if (sql.includes('COUNT(v.id)')) {
          const excluded = new Set(JSON.parse(values[0] as string) as string[]);
          const counted = votes.filter(
            (v) => v.talk_id === 1 && !excluded.has(v.user_id)
          );
          return {
            results: [{ talk_id: 1, title: 'A', votes: counted.length }] as T[],
          };
        }
        if (sql.includes('ROW_NUMBER()'))
          return {
            results: votes
              .filter((v) => v.talk_id === values[0])
              .map((v, i) => ({ ...v, position: i + 1 })) as T[],
          };
        return { results: [] as T[] };
      },
    }),
  }),
});

const votes: Vote[] = [
  {
    user_id: 'sympla:UV8M-ZA-U6D6',
    talk_id: 1,
    created_at: '2026-09-25 10:00',
  },
  {
    user_id: 'sympla:AAAA-BB-CCCC',
    talk_id: 1,
    created_at: '2026-09-25 11:00',
  },
];

const env = (token?: string): Env =>
  ({ ENVIRONMENT: 'development', SYMPLA_TOKEN: token }) as Env;

const adminReq = (url: string): Request =>
  new Request(`http://localhost${url}`, {
    headers: { 'X-Dev-User': 'organizer-1', 'X-Dev-Admin': '1' },
  });

// Sympla answers the cancelled-only listing with these tickets; `down` fails every request.
const stubSympla = (cancelled: string[], down = false) => {
  const urls: string[] = [];
  globalThis.fetch = (async (input: string) => {
    urls.push(String(input));
    if (down) throw new Error('network');
    return Response.json({
      data: cancelled.map((ticket_number) => ({ ticket_number })),
      pagination: { next_cursor: null },
    });
  }) as typeof fetch;
  return urls;
};

describe('admin tally skips cancelled Sympla tickets', async () => {
  await it('leaves cancelled tickets out of the summary count', async () => {
    const urls = stubSympla(['UV8M-ZA-U6D6']);
    const res = await routes.adminVotes({
      request: adminReq('/api/admin/votes'),
      cors,
      database: makeDb(votes),
      env: env('tok'),
    });
    globalThis.fetch = realFetch;

    const body = (await res.json()) as {
      total: number;
      symplaChecked: boolean;
    };
    assert.equal(body.total, 1);
    assert.equal(body.symplaChecked, true);
    assert.ok(urls[0]?.includes('cancelled_filter=only'));
  });

  await it('hides cancelled tickets from the per-talk drill-down too', async () => {
    stubSympla(['UV8M-ZA-U6D6']);
    const res = await routes.adminVoteDetail({
      request: adminReq('/api/admin/votes/detail?talkId=1'),
      cors,
      database: makeDb(votes),
      env: env('tok'),
    });
    globalThis.fetch = realFetch;

    const body = (await res.json()) as { votes: { userId: string }[] };
    assert.deepEqual(
      body.votes.map((v) => v.userId),
      ['sympla:AAAA-BB-CCCC']
    );
  });

  await it('counts everything and says so when Sympla is down', async () => {
    stubSympla([], true);
    const res = await routes.adminVotes({
      request: adminReq('/api/admin/votes'),
      cors,
      database: makeDb(votes),
      env: env('tok'),
    });
    globalThis.fetch = realFetch;

    const body = (await res.json()) as {
      total: number;
      symplaChecked: boolean;
    };
    assert.equal(res.status, 200);
    assert.equal(body.total, 2);
    assert.equal(body.symplaChecked, false);
  });
});
