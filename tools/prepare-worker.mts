import { readFileSync, writeFileSync } from 'node:fs';
import { env, exit } from 'node:process';

const { WORKER_D1, CLOUDFLARE_ACCOUNT_ID } = env;
const config = 'wrangler.jsonc';

if (!WORKER_D1) {
  console.error('Missing WORKER_D1 in .env');
  exit(1);
}

if (!CLOUDFLARE_ACCOUNT_ID) {
  console.error('Missing CLOUDFLARE_ACCOUNT_ID in .env');
  exit(1);
}

const original = readFileSync(config, 'utf-8');
const patched = original.replace(
  '"database_id": "local"',
  `"database_id": "${WORKER_D1}"`
);

writeFileSync(config, patched);
