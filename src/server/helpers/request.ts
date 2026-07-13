export const isJsonContentType = (request: Request): boolean =>
  (request.headers.get('Content-Type') ?? '').includes('application/json');

export const isWithinSize = (text: string, max: number): boolean =>
  text.length <= max;

export const parseBody = (text: string): unknown | undefined => {
  try {
    return JSON.parse(text);
  } catch {
    return;
  }
};

type ParseResult<T> = { data: T } | { error: string; status: number };

// Runs the JSON request gauntlet (content type, size, JSON, schema) shared by the
// c4p and vote routes. Returns the validated data or an { error, status } to respond with.
export const parseRequest = async <T>(
  request: Request,
  schema: {
    safeParse(input: unknown): { success: true; data: T } | { success: false };
  },
  maxSize: number
): Promise<ParseResult<T>> => {
  if (!isJsonContentType(request))
    return { error: 'Unsupported content type.', status: 415 };

  const text = await request.text();
  if (!isWithinSize(text, maxSize))
    return { error: 'Payload too large.', status: 413 };

  const body = parseBody(text);
  if (body === undefined) return { error: 'Invalid JSON.', status: 400 };

  const parsed = schema.safeParse(body);
  if (!parsed.success) return { error: 'Invalid input.', status: 422 };
  return { data: parsed.data };
};
