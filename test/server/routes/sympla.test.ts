import type { Database, Env } from '../../../src/server/types.js';
import { assert, describe, it } from 'poku';
import { verifySession } from '../../../src/server/helpers/session.js';
import {
  fetchSymplaTicket,
  isValidSymplaLogin,
  normalizeTicketNumber,
} from '../../../src/server/helpers/sympla.js';
import { routes } from '../../../src/server/routes.js';

const cors = { 'Access-Control-Allow-Origin': '*' };
const realFetch = globalThis.fetch;

type Ticket = { email: string; first_name: string; order_status: string };

// Fakes Sympla: every ticket in `tickets` answers 200 with its participant, anything else 404
// (what the live API does for an unknown ticket, despite the spec saying 204).
// `down` makes every call fail like a network error.
const mockSympla = (tickets: Record<string, Ticket>, down = false) => {
  const calls: { url: string; token: string | null }[] = [];
  globalThis.fetch = (async (input: string, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, token: new Headers(init?.headers).get('s_token') });
    if (down) throw new Error('network');
    const ticket = decodeURIComponent(
      url.split('/ticketNumber/')[1]?.split('?')[0] ?? ''
    );
    const participant = tickets[ticket];
    if (!participant) return new Response('{}', { status: 404 });
    return Response.json({ data: participant });
  }) as typeof fetch;
  return calls;
};

// In-memory sympla_guild_join: ticket_number -> email.
const makeDb = () => {
  const rows = new Map<string, string>();
  const database: Database = {
    prepare: (sql: string) => ({
      bind: (...values: unknown[]) => ({
        run: async () => {
          if (!sql.includes('INTO sympla_guild_join')) return;
          const [ticket, email] = values as [string, string];
          rows.set(ticket, email);
        },
        all: async <T>() => ({ results: [] as T[] }),
      }),
    }),
  };
  return { database, rows };
};

const env = { SESSION_SECRET: 'secret', SYMPLA_TOKEN: 'tok' } as Env;

const paid: Ticket = {
  email: 'Ana@Example.com',
  first_name: 'Ana',
  order_status: 'APPROVED',
};

const ticketReq = (ticketNumber: unknown, email: unknown): Request =>
  new Request('http://localhost/api/vote/ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketNumber, email }),
  });

const login = (request: Request, database: Database, e: Env = env) =>
  routes.authTicket({ request, cors, database, env: e });

// One outer block so the inner ones run in order: they all swap the global fetch mock, and
// unawaited describe blocks run concurrently and overwrite each other's mock.
describe('sympla ticket login', async () => {
  await describe('helpers.sympla', async () => {
    await it('fetches the participant from the JSConf event with the s_token header', async () => {
      const calls = mockSympla({ '111111': paid });
      assert.deepEqual(await fetchSymplaTicket('tok', '111111'), paid);
      assert.equal(calls[0]?.token, 'tok');
      assert.ok(
        calls[0]?.url.startsWith(
          'https://api.sympla.com.br/public/v1.6.0/events/s36d6ce/participants/ticketNumber/111111'
        )
      );
      globalThis.fetch = realFetch;
    });

    await it('returns an empty participant for unknown tickets, null when Sympla is down', async () => {
      mockSympla({});
      assert.deepEqual(await fetchSymplaTicket('tok', '999999'), {});
      mockSympla({}, true);
      assert.equal(await fetchSymplaTicket('tok', '111111'), null);
      globalThis.fetch = realFetch;
    });

    await it('accepts only approved orders with a matching email', () => {
      assert.equal(isValidSymplaLogin(paid, ' ana@example.COM '), true);
      assert.equal(isValidSymplaLogin(paid, 'other@example.com'), false);
      assert.equal(
        isValidSymplaLogin(
          { ...paid, order_status: 'CANCELLED' },
          'ana@example.com'
        ),
        false
      );
      assert.equal(
        isValidSymplaLogin({ ...paid, order_status: 'A' }, 'ana@example.com'),
        false
      );
      assert.equal(isValidSymplaLogin({}, 'ana@example.com'), false);
    });
  });

  await describe('routes.authTicket', async () => {
    await it('logs in a paid ticket as sympla:<ticket> with one vote and remembers it', async () => {
      mockSympla({ '111111': paid });
      const { database, rows } = makeDb();
      const res = await login(
        ticketReq(' 111111 ', 'ana@example.com'),
        database
      );
      assert.equal(res.status, 200);
      assert.equal(rows.get('111111'), 'ana@example.com');
      const cookie = res.headers.get('Set-Cookie') ?? '';
      const token = cookie.split(';')[0]?.split('=')[1] ?? '';
      assert.deepEqual(await verifySession(token, 'secret'), {
        userId: 'sympla:111111',
        budget: 1,
        name: 'Ana',
      });
      globalThis.fetch = realFetch;
    });

    await it('answers 422 for wrong email, unpaid order and unknown ticket alike', async () => {
      mockSympla({
        '111111': paid,
        '222222': { ...paid, order_status: 'CANCELLED' },
      });
      const { database, rows } = makeDb();
      const wrongEmail = await login(
        ticketReq('111111', 'x@example.com'),
        database
      );
      const unpaid = await login(
        ticketReq('222222', 'ana@example.com'),
        database
      );
      const unknown = await login(
        ticketReq('999999', 'ana@example.com'),
        database
      );
      for (const res of [wrongEmail, unpaid, unknown]) {
        assert.equal(res.status, 422);
        assert.deepEqual(await res.json(), { error: 'Invalid ticket.' });
        assert.equal(res.headers.get('Set-Cookie'), null);
      }
      assert.equal(rows.size, 0);
      globalThis.fetch = realFetch;
    });

    await it('502s when Sympla is down, 422s on malformed input', async () => {
      mockSympla({}, true);
      const { database } = makeDb();
      assert.equal(
        (await login(ticketReq('111111', 'ana@example.com'), database)).status,
        502
      );
      assert.equal(
        (await login(ticketReq('../evil', 'ana@example.com'), database)).status,
        422
      );
      assert.equal(
        (await login(ticketReq('111111', 'not-an-email'), database)).status,
        422
      );
      globalThis.fetch = realFetch;
    });

    await it('500s when SYMPLA_TOKEN is missing', async () => {
      const { database } = makeDb();
      const res = await login(
        ticketReq('111111', 'ana@example.com'),
        database,
        {
          SESSION_SECRET: 'secret',
        } as Env
      );
      assert.equal(res.status, 500);
    });
  });

  await describe('helpers.sympla.normalizeTicketNumber', async () => {
    await it('uppercases and restores the 4-2-4 dashes on a bare code', () => {
      assert.equal(normalizeTicketNumber('uv8m-za-u6d6'), 'UV8M-ZA-U6D6');
      assert.equal(normalizeTicketNumber(' UV8MZAU6D6 '), 'UV8M-ZA-U6D6');
      assert.equal(normalizeTicketNumber('UV8M-ZA-U6D6'), 'UV8M-ZA-U6D6');
      // Not the 10-character shape: left alone for Sympla to judge.
      assert.equal(normalizeTicketNumber('3dlmebnc7uq'), '3DLMEBNC7UQ');
    });

    await it('logs in with a lowercase dashless code and stores the canonical number', async () => {
      mockSympla({ 'UV8M-ZA-U6D6': paid });
      const { database, rows } = makeDb();
      const res = await login(
        ticketReq('uv8mzau6d6', 'ana@example.com'),
        database
      );
      assert.equal(res.status, 200);
      assert.equal(rows.get('UV8M-ZA-U6D6'), 'ana@example.com');
      globalThis.fetch = realFetch;
    });
  });
});
