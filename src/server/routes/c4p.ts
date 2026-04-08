import type { Database } from '../types.js';
import {
  isJsonContentType,
  isWithinSize,
  parseBody,
} from '../helpers/request.js';
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
  if (!isJsonContentType(request))
    return response({ error: 'Unsupported content type.' }, 415, cors);

  const text = await request.text();
  if (!isWithinSize(text, 16384))
    return response({ error: 'Payload too large.' }, 413, cors);

  const body = parseBody(text);
  if (!body) return response({ error: 'Invalid JSON.' }, 400, cors);

  const { schema, submit } = repository(database);

  const parsed = schema.safeParse(body);
  if (!parsed.success) return response({ error: 'Invalid input.' }, 422, cors);

  const result = await submit(parsed.data, ip);

  if (!result.success) {
    if (result.reason === 'talk_limit')
      return response({ error: 'Talk limit exceeded.' }, 422, cors);
    return response({ error: 'Internal error.' }, 500, cors);
  }

  return response({ success: true }, 201, cors);
};
