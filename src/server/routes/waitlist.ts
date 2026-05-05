import type { Database } from '../types.js';
import type { RouteContext } from './types.js';
import { parseRequest } from '../helpers/request.js';
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
}: RouteContext & Options): Promise<Response> => {
  const { schema, canInsert, insert } = repository(database);

  const parsed = await parseRequest(request, schema, cors);
  if (parsed instanceof Response) return parsed;

  const { email, website, utmSource } = parsed;

  // Bot Honeypot
  if (website.length > 0) return response({ success: true }, 201, cors);

  if (!(await canInsert(ip)))
    return response({ error: 'Daily limit exceeded.' }, 429, cors);

  const inserted = await insert(email, utmSource, ip);
  if (!inserted) return response({ error: 'Internal error.' }, 500, cors);

  return response({ success: true }, 201, cors);
};
