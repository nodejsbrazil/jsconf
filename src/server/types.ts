export type Database = {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>;
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
  };
};

export type Env = {
  DB: Database;
  ALLOWED_ORIGIN?: string;
  ENVIRONMENT?: string;
  // Voting / guild.host OAuth
  GUILD_OAUTH_CLIENT_ID?: string;
  GUILD_OAUTH_CLIENT_SECRET?: string;
  GUILD_OAUTH_REDIRECT_URI?: string;
  SESSION_SECRET?: string;
  // Manager refresh token (from a one-time manager login); the server exchanges it for an access
  // token to read the event attendees list — the only place the ticketing tier is exposed.
  GUILD_ORG_REFRESH_TOKEN?: string;
};
