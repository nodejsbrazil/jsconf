import type { Database } from '../types.js';
import { z } from 'zod';

export const vote = (database: Database) => {
  const schema = z.object({
    code: z.string().length(4),
    talk_id: z.number().int().positive(),
  });

  const hasVoted = async (userId: number, talkId: number) => {
    const { results } = await database
      .prepare('SELECT id FROM votes WHERE user_id = ? AND talk_id = ?')
      .bind(userId, talkId)
      .all<{ id: number }>();
    return results.length > 0;
  };

  const cast = async (userId: number, talkId: number) => {
    await database
      .prepare('INSERT INTO votes (user_id, talk_id) VALUES (?, ?)')
      .bind(userId, talkId)
      .run();
  };

  const retract = async (userId: number, talkId: number) => {
    await database
      .prepare('DELETE FROM votes WHERE user_id = ? AND talk_id = ?')
      .bind(userId, talkId)
      .run();
  };

  return { schema, hasVoted, cast, retract };
};
