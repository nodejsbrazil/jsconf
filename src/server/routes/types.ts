import type { CodeSender } from '../code-sender.js';
import type { Database, Env } from '../types.js';

export interface RouteContext {
  request: Request;
  cors: Record<string, string>;
  database: Database;
  env: Env;
  sender: CodeSender;
}
