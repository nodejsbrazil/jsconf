import type { Database } from '../types.js';
import { response } from '../helpers/response.js';
import { waitlist as repository } from '../repositories/waitlist.js';

export const waitlist = async (
  body: unknown,
  cors: Record<string, string>,
  database: Database
): Promise<Response> => {
  const { schema, insert } = repository(database);

  const parsed = schema.safeParse(body);
  if (!parsed.success) return response({ error: 'invalid_input' }, 422, cors);

  const { email, website, utmSource } = parsed.data;

  // Bot Honeypot
  if (website.length > 0) return response({ success: true }, 201, cors);

  const inserted = await insert(email, utmSource);
  if (!inserted) return response({ error: 'internal_error' }, 500, cors);

  return response({ success: true }, 201, cors);
};
