import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { env, exit } from 'node:process';
import { JSONC } from 'jsonc.min';

const { WORKER_D1, CLOUDFLARE_ACCOUNT_ID } = env;

if (!WORKER_D1 || !CLOUDFLARE_ACCOUNT_ID) {
  console.info(
    'Skipping worker preparation: WORKER_D1 or CLOUDFLARE_ACCOUNT_ID not set'
  );
  exit(0);
}

type D1Database = {
  database_id: string;
};

type WranglerConfig = {
  $schema?: string;
  d1_databases: D1Database[];
};

const config = JSONC.parse<WranglerConfig>(
  readFileSync('wrangler.jsonc', 'utf-8')
);

const database = config.d1_databases[0];

if (!database) {
  console.error('Missing d1_databases in wrangler.jsonc');
  exit(1);
}

database.database_id = WORKER_D1;
delete config.$schema;

mkdirSync('server', { recursive: true });
writeFileSync('server/wrangler.jsonc', JSONC.minify(JSON.stringify(config)));
