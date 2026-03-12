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
