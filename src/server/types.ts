export interface Database {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>;
    };
  };
}

export interface Env {
  DB: Database;
  ALLOWED_ORIGIN?: string;
}
