import { z } from 'zod';
import { response } from './response.js';

export const isJsonContentType = (request: Request): boolean =>
  (request.headers.get('Content-Type') ?? '').includes('application/json');

/**
 * Parses and validates a request body against a Zod schema.
 * Returns the parsed body on success, or a Response (with error) on failure.
 * Usage in route:
 *   const parsed = await parseRequest(request, schema, cors);
 *   if (parsed instanceof Response) return parsed;
 *   // body is typed as T here
 */
export async function parseRequest<T>(
  request: Request,
  schema: z.Schema<T>,
  cors: Record<string, string>
): Promise<Response | T> {
  if (!isJsonContentType(request)) {
    return response(
      { error: 'Content-Type must be application/json' },
      415,
      cors
    );
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return response({ error: 'Invalid JSON.' }, 400, cors);
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return response({ error: 'Invalid JSON.' }, 400, cors);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const details = z.treeifyError(parsed.error);
    return response({ error: 'Validation failed', details }, 422, cors);
  }

  return parsed.data;
}
