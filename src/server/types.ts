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
  GUILD_ORG_REFRESH_TOKEN?: string;
  SESSION_SECRET?: string;
};
