import type { Database } from '../types.js';
import { response } from '../helpers/response.js';
import { waitlist as repository } from '../repositories/waitlist.js';

type Options = {
  body: unknown;
  cors: Record<string, string>;
  database: Database;
  ip: string;
};

export const waitlist = async ({
  body,
  cors,
  database,
  ip,
}: Options): Promise<Response> => {
  const { schema, canInsert, insert } = repository(database);

  const parsed = schema.safeParse(body);
  if (!parsed.success) return response({ error: 'Invalid input.' }, 422, cors);

  const { email, website, utmSource } = parsed.data;

  // Bot Honeypot
  if (website.length > 0) return response({ success: true }, 201, cors);

  if (!(await canInsert(ip)))
    return response({ error: 'Daily limit exceeded.' }, 429, cors);

  const inserted = await insert(email, utmSource, ip);
  if (!inserted) return response({ error: 'Internal error.' }, 500, cors);

  return response({ success: true }, 201, cors);
};
