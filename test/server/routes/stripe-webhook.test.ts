import type { Env } from '../../../src/server/types.js';
import { createHmac } from 'node:crypto';
import { assert, describe, it } from 'poku';
import { routes } from '../../../src/server/routes.js';
import { handleEvent } from '../../../src/server/routes/stripe-webhook.js';

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

describe('handleEvent', async () => {
  const makeEvent = (type: string) =>
    ({ type, data: { object: { id: 'obj_123' } } }) as never;

  await it('returns true for checkout.session.completed', () => {
    assert.equal(handleEvent(makeEvent('checkout.session.completed')), true);
  });

  await it('returns true for payment_intent.succeeded', () => {
    assert.equal(handleEvent(makeEvent('payment_intent.succeeded')), true);
  });

  await it('returns true for charge.succeeded', () => {
    assert.equal(handleEvent(makeEvent('charge.succeeded')), true);
  });

  await it('returns true for charge.refunded', () => {
    assert.equal(handleEvent(makeEvent('charge.refunded')), true);
  });

  await it('returns false for unknown event types', () => {
    assert.equal(handleEvent(makeEvent('unknown.event')), false);
  });
});

describe('routes.stripeWebhook', async () => {
  await it('returns 400 when stripe-signature header is missing', async () => {
    const payload = makeEventPayload('payment_intent.succeeded');
    const request = makeWebhookRequest(payload);
    const res = await routes.stripeWebhook({ request, cors, env: mockEnv });

    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'Missing signature.' });
  });

  await it('returns 400 for invalid signature', async () => {
    const payload = makeEventPayload('payment_intent.succeeded');
    const request = makeWebhookRequest(payload, 't=123,v1=invalid');
    const res = await routes.stripeWebhook({ request, cors, env: mockEnv });

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
    const res = await routes.stripeWebhook({ request, cors, env: mockEnv });

    assert.equal(res.status, 400);
  });

  await it('returns 200 for a valid signed event', async () => {
    const payload = makeEventPayload('payment_intent.succeeded');
    const signature = signPayload(payload, WEBHOOK_SECRET);
    const request = makeWebhookRequest(payload, signature);
    const res = await routes.stripeWebhook({ request, cors, env: mockEnv });

    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { received: true });
  });
});
