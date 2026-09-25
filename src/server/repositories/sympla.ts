import type { Database } from '../types.js';

// Records every Sympla ticket that logged in to vote, with its email, so the votes can be tied to a
// guild.host account later (guild_user_id stays NULL until that backfill exists).
export const symplaJoin = (database: Database) => {
  const remember = async (ticketNumber: string, email: string) => {
    await database
      .prepare(
        `INSERT INTO sympla_guild_join (ticket_number, email) VALUES (?, ?)
         ON CONFLICT(ticket_number) DO UPDATE SET email = excluded.email`
      )
      .bind(ticketNumber, email)
      .run();
  };

  return { remember };
};
