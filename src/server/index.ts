import type { Env } from './types.js';
import { handleWaitlist } from './handler.js';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleWaitlist(request, env);
  },
} satisfies ExportedHandler<Env>;
