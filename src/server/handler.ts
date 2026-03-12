import { json } from './json.js';
import { BodySchema } from './schema.js';

export interface WaitlistDB {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>;
    };
  };
}

export interface Env {
  DB: WaitlistDB;
  ALLOWED_ORIGIN?: string;
}

export const handleWaitlist = async (
  request: Request,
  env: Env
): Promise<Response> => {
  const origin = env.ALLOWED_ORIGIN || '*';
  const cors = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const url = new URL(request.url);

  if (url.pathname !== '/api/waitlist' || request.method !== 'POST') {
    return json({ error: 'not_found' }, 404, cors);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400, cors);
  }

  const parsed = BodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return json({ error: 'invalid_input' }, 422, cors);
  }

  const { email, website, utmSource } = parsed.data;

  // Honeypot: bots fill this field — silently pretend success to avoid signalling detection
  if (website.length > 0) {
    return json({ success: true }, 201, cors);
  }

  try {
    await env.DB.prepare(
      'INSERT INTO waitlist (email, utm_source) VALUES (?, ?)'
    )
      .bind(email, utmSource ?? null)
      .run();
  } catch (e) {
    if (e instanceof Error && e.message.includes('UNIQUE')) {
      return json({ success: true }, 201, cors);
    }

    return json({ error: 'internal_error' }, 500, cors);
  }

  return json({ success: true }, 201, cors);
};
