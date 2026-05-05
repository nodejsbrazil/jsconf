import type { Env } from '../../../src/server/types.js';
import { createHmac } from 'node:crypto';
import { assert, describe, it } from 'poku';
import { routes } from '../../../src/server/routes.js';
import {
  extractUserData,
  handleEvent,
} from '../../../src/server/routes/stripe-webhook.js';

const WEBHOOK_SECRET = 'whsec_test_secret';
const API_KEY = 'sk_test_fake';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Vary: 'Origin',
};

const mockEnv: Env = {
  DB: {
    prepare: () => ({
      bind: () => ({
        run: async () => {},
        all: async <T>() => ({ results: [] as T[] }),
      }),
    }),
  },
  STRIPE_SECRET_KEY: API_KEY,
  STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
  ADMIN_KEY: 'test',
  JWT_SECRET: 'test-secret-32-chars-minimum-here',
};

const makeEventPayload = (type: string, id = 'evt_test_123') =>
  JSON.stringify({
    id,
    object: 'event',
    type,
    api_version: '2026-03-25.dahlia',
    created: Math.floor(Date.now() / 1000),
    data: { object: { id: `obj_${id}` } },
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
  });

const signPayload = (payload: string, secret: string): string => {
  const timestamp = Math.floor(Date.now() / 1000);
  const sig = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`, 'utf8')
    .digest('hex');
  return `t=${timestamp},v1=${sig}`;
};

const makeWebhookRequest = (payload: string, signature?: string): Request =>
  new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(signature ? { 'stripe-signature': signature } : {}),
    },
    body: payload,
  });

describe('stripe webhook', async () => {
  describe('extractUserData', async () => {
    await it('returns null when customer_email is missing', async () => {
      const result = extractUserData({
        customer_email: undefined,
        created: Math.floor(Date.now() / 1000),
        metadata: { quantity: '1' },
      } as never);
      assert.equal(result, null);
    });

    await it('returns null when quantity is 0 or negative', async () => {
      const result = extractUserData({
        customer_email: 'test@example.com',
        created: Math.floor(Date.now() / 1000),
        metadata: { quantity: '0' },
      } as never);
      assert.equal(result, null);
    });

    await it('returns early bird (type 2, 3 votes/ticket) for purchase on Dec 31 2026', async () => {
      const cutoff = new Date('2026-12-31T23:59:59Z').getTime() / 1000;
      const result = extractUserData({
        customer_email: 'early@example.com',
        created: cutoff,
        metadata: { quantity: '2' },
      } as never);
      assert.ok(result !== null);
      assert.deepEqual(result, {
        email: 'early@example.com',
        ticketType: 2,
        quantity: 2,
        votesAllowed: 6,
      });
    });

    await it('returns regular (type 1, 1 vote/ticket) for purchase after Dec 31 2026', async () => {
      const after = new Date('2027-01-01T00:00:00Z').getTime() / 1000;
      const result = extractUserData({
        customer_email: 'regular@example.com',
        created: after,
        metadata: { quantity: '1' },
      } as never);
      assert.ok(result !== null);
      assert.deepEqual(result, {
        email: 'regular@example.com',
        ticketType: 1,
        quantity: 1,
        votesAllowed: 1,
      });
    });

    await it('uses default quantity 1 when metadata.quantity is missing', async () => {
      const result = extractUserData({
        customer_email: 'test@example.com',
        created: Math.floor(Date.now() / 1000),
        metadata: undefined,
      } as never);
      assert.ok(result !== null);
      assert.equal(result!.quantity, 1);
    });

    await it('returns correct votes for multi-ticket early bird', async () => {
      const cutoff = new Date('2026-06-15').getTime() / 1000;
      const result = extractUserData({
        customer_email: 'bulk@example.com',
        created: cutoff,
        metadata: { quantity: '5' },
      } as never);
      assert.ok(result !== null);
      assert.deepEqual(result, {
        email: 'bulk@example.com',
        ticketType: 2,
        quantity: 5,
        votesAllowed: 15,
      });
    });
  });

  describe('handleEvent', async () => {
    const makeEvent = (
      type: string,
      obj: Record<string, unknown> = { id: 'obj_123' }
    ) => ({ type, data: { object: obj } }) as never;

    await it('inserts user with quantity for early bird checkout', async () => {
      let insertSql = '';
      const mockDb = {
        prepare: (sql: string) => ({
          bind: (..._values: unknown[]) => {
            insertSql = sql;
            return {
              run: async () => {},
              all: async <T>() => ({ results: [] as T[] }),
            };
          },
        }),
      };

      const cutoff = new Date('2026-12-31T23:59:59Z').getTime() / 1000;
      const result = await handleEvent(
        makeEvent('checkout.session.completed', {
          id: 'cs_test',
          customer_email: 'early@example.com',
          created: cutoff,
          metadata: { quantity: '3' },
        }),
        mockDb as never
      );
      assert.equal(result, true);
      assert.ok(insertSql.includes('INSERT INTO users'));
    });

    await it('returns true when data extraction fails (no email)', async () => {
      const result = await handleEvent(
        makeEvent('checkout.session.completed', {
          id: 'cs_test',
          customer_email: undefined,
          created: Math.floor(Date.now() / 1000),
          metadata: { quantity: '1' },
        }),
        mockEnv.DB
      );
      assert.equal(result, true);
    });

    await it('returns true for payment_intent.succeeded', async () => {
      assert.equal(
        await handleEvent(makeEvent('payment_intent.succeeded'), mockEnv.DB),
        true
      );
    });

    await it('returns true for charge.succeeded', async () => {
      assert.equal(
        await handleEvent(makeEvent('charge.succeeded'), mockEnv.DB),
        true
      );
    });

    await it('returns true for charge.refunded and calls revoke', async () => {
      let revokeCalled = false;
      const mockDb = {
        prepare: (sql: string) => ({
          bind: (..._: unknown[]) => ({
            run: async () => {
              if (
                sql.includes('DELETE FROM votes') ||
                sql.includes('UPDATE users SET votes_allowed = 0')
              ) {
                revokeCalled = true;
              }
            },
            all: async <T>() => {
              if (sql.includes('SELECT id FROM users')) {
                return { results: [{ id: 1 }] as T[] };
              }
              return { results: [] as T[] };
            },
          }),
        }),
      };

      const result = await handleEvent(
        makeEvent('charge.refunded', {
          id: 'ch_test',
          billing_details: { email: 'refund@example.com' },
        }),
        mockDb as never
      );
      assert.equal(result, true);
      assert.equal(revokeCalled, true);
    });

    await it('returns false for unknown event types', async () => {
      assert.equal(
        await handleEvent(makeEvent('unknown.event'), mockEnv.DB),
        false
      );
    });
  });

  await describe('routes.stripeWebhook', async () => {
    await it('returns 400 when stripe-signature header is missing', async () => {
      const payload = makeEventPayload('payment_intent.succeeded');
      const request = makeWebhookRequest(payload);
      const res = await routes.stripeWebhook({
        request,
        cors,
        env: mockEnv,
        database: mockEnv.DB,
      });

      assert.equal(res.status, 400);
      assert.deepEqual(await res.json(), { error: 'Missing signature.' });
    });

    await it('returns 400 for invalid signature', async () => {
      const payload = makeEventPayload('payment_intent.succeeded');
      const request = makeWebhookRequest(payload, 't=123,v1=invalid');
      const res = await routes.stripeWebhook({
        request,
        cors,
        env: mockEnv,
        database: mockEnv.DB,
      });

      assert.equal(res.status, 400);
      assert.deepEqual(await res.json(), {
        error: 'Webhook signature verification failed.',
      });
    });

    await it('returns 400 for tampered payload', async () => {
      const payload = makeEventPayload('payment_intent.succeeded');
      const signature = signPayload(payload, WEBHOOK_SECRET);
      const tampered = makeEventPayload('charge.succeeded');
      const request = makeWebhookRequest(tampered, signature);
      const res = await routes.stripeWebhook({
        request,
        cors,
        env: mockEnv,
        database: mockEnv.DB,
      });

      assert.equal(res.status, 400);
    });

    await it('returns 200 for a valid signed event', async () => {
      const payload = makeEventPayload('payment_intent.succeeded');
      const signature = signPayload(payload, WEBHOOK_SECRET);
      const request = makeWebhookRequest(payload, signature);
      const res = await routes.stripeWebhook({
        request,
        cors,
        env: mockEnv,
        database: mockEnv.DB,
      });

      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { received: true });
    });
  });
});
