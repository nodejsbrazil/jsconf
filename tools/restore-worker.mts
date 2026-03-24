import { readFileSync, writeFileSync } from 'node:fs';
import { env } from 'node:process';

const { WORKER_D1 } = env;
const config = 'wrangler.jsonc';

const current = readFileSync(config, 'utf-8');
const restored = current.replace(
  `"database_id": "${WORKER_D1}"`,
  '"database_id": "local"'
);

writeFileSync(config, restored);
