import type { Database } from '../types.js';
import { parseRequest } from '../helpers/request.js';
import { response } from '../helpers/response.js';
import { c4p as repository } from '../repositories/c4p.js';

type Options = {
  request: Request;
  cors: Record<string, string>;
  database: Database;
  ip: string;
};

export const c4p = async ({
  request,
  cors,
  database,
  ip,
}: Options): Promise<Response> => {
  const { schema, submit } = repository(database);

  const parsed = await parseRequest(request, schema, 16384);
  if ('error' in parsed)
    return response({ error: parsed.error }, parsed.status, cors);

  // Bot Honeypot
  if (parsed.data.confirm_email.length > 0)
    return response({ success: true }, 201, cors);

  const result = await submit(parsed.data, ip);

  if (!result.success) {
    if (result.reason === 'talk_limit')
      return response({ error: 'Talk limit exceeded.' }, 422, cors);
    return response({ error: 'Internal error.' }, 500, cors);
  }

  return response({ success: true }, 201, cors);
};
