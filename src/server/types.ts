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
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  ADMIN_KEY: string;
  JWT_SECRET: string;
  ENVIRONMENT?: string;
};
