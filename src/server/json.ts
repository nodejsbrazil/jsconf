export const json = (
  body: unknown,
  status: number,
  extra: Record<string, string> = Object.create(null)
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
