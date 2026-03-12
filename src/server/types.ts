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
};
