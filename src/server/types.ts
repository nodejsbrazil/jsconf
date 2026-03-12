export type Database = {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>;
    };
  };
};

export type Env = {
  DB: Database;
  ALLOWED_ORIGIN?: string;
};
