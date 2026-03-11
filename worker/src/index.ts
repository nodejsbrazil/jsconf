import { handleWaitlist } from './handler';

export interface Env {
  DB: D1Database;
  /** The frontend origin allowed to call this worker, e.g. "https://jsconfbr.weslley.io" */
  ALLOWED_ORIGIN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleWaitlist(request, env.DB, env.ALLOWED_ORIGIN ?? '*');
  },
} satisfies ExportedHandler<Env>;
