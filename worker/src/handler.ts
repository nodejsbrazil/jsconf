import { corsHeaders } from './cors';
import { json } from './json';
import { BodySchema } from './schema';

/** Minimal DB interface — keeps the handler decoupled from Cloudflare's D1 specifics */
export interface WaitlistDB {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>;
    };
  };
}

export async function handleWaitlist(
  request: Request,
  db: WaitlistDB,
  allowedOrigin: string
): Promise<Response> {
  const cors = corsHeaders(allowedOrigin);

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
    await db
      .prepare('INSERT INTO waitlist (email, utm_source) VALUES (?, ?)')
      .bind(email, utmSource ?? null)
      .run();
  } catch (e) {
    // Return the same success response on duplicate to avoid leaking whether an email is registered
    if (e instanceof Error && e.message.includes('UNIQUE')) {
      return json({ success: true }, 201, cors);
    }
    return json({ error: 'internal_error' }, 500, cors);
  }

  return json({ success: true }, 201, cors);
}
