import type { Database } from '../types.js';
import {
  isJsonContentType,
  isWithinSize,
  parseBody,
} from '../helpers/request.js';
import { response } from '../helpers/response.js';
import { waitlist as repository } from '../repositories/waitlist.js';

type Options = {
  request: Request;
  cors: Record<string, string>;
  database: Database;
  ip: string;
};

export const waitlist = async ({
  request,
  cors,
  database,
  ip,
}: Options): Promise<Response> => {
  if (!isJsonContentType(request))
    return response({ error: 'Unsupported content type.' }, 415, cors);

  const text = await request.text();
  if (!isWithinSize(text, 1024))
    return response({ error: 'Payload too large.' }, 413, cors);

  const body = parseBody(text);
  if (!body) return response({ error: 'Invalid JSON.' }, 400, cors);

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
