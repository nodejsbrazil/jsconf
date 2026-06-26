import type { Database, Env } from '../types.js';
import { refreshToken } from '../helpers/oauth.js';

const NAME = 'organizer';
const BUFFER_SECONDS = 60;

type Row = { access_token: string; refresh_token: string; expires_at: number };

const readRow = async (database: Database): Promise<Row | null> => {
  const { results } = await database
    .prepare(
      'SELECT access_token, refresh_token, expires_at FROM oauth_tokens WHERE name = ?'
    )
    .bind(NAME)
    .all<Row>();
  return results[0] ?? null;
};

const writeRow = async (
  database: Database,
  access: string,
  refresh: string,
  expiresAt: number
): Promise<void> => {
  await database
    .prepare(
      `INSERT INTO oauth_tokens (name, access_token, refresh_token, expires_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(name) DO UPDATE SET
         access_token = excluded.access_token,
         refresh_token = excluded.refresh_token,
         expires_at = excluded.expires_at`
    )
    .bind(NAME, access, refresh, expiresAt)
    .run();
};

// Returns a valid organizer access token, refreshing (and persisting the rotated refresh
// token) when the stored one is near expiry. Seeds from GUILD_ORG_REFRESH_TOKEN on first use.
export const getOrgAccessToken = async (
  env: Env,
  database: Database
): Promise<string | null> => {
  const now = Math.floor(Date.now() / 1000);
  const row = await readRow(database);
  if (row && row.expires_at > now + BUFFER_SECONDS) return row.access_token;

  const refresh = row?.refresh_token ?? env.GUILD_ORG_REFRESH_TOKEN;
  if (!refresh || !env.GUILD_OAUTH_CLIENT_ID || !env.GUILD_OAUTH_CLIENT_SECRET)
    return null;

  const tokens = await refreshToken(
    refresh,
    env.GUILD_OAUTH_CLIENT_ID,
    env.GUILD_OAUTH_CLIENT_SECRET
  );

  if (!tokens) {
    // ponytail: refresh tokens rotate, so a concurrent isolate may have just consumed ours.
    // Re-read — if another isolate wrote a fresh token, use it; otherwise give up.
    const fresh = await readRow(database);
    if (fresh && fresh.expires_at > now + BUFFER_SECONDS)
      return fresh.access_token;
    return null;
  }

  await writeRow(
    database,
    tokens.access_token,
    tokens.refresh_token ?? refresh,
    now + tokens.expires_in
  );
  return tokens.access_token;
};
