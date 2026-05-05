import { z } from 'zod';

export async function parseJsonResponse<T>(
  response: Promise<Response>,
  schema: z.Schema<T>
): Promise<T> {
  const res = await response;
  const json = await res.json();
  return schema.parse(json);
}

export async function parseJsonSafe<T>(
  response: Promise<Response>,
  schema: z.Schema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const res = await response;
    const json = await res.json();
    const parsed = schema.parse(json);
    return { success: true, data: parsed };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(e.issues) };
    }
    return { success: false, error: String(e) };
  }
}
