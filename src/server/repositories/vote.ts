import type { Database } from '../types.js';

export type TalkRow = {
  id: number;
  title: string;
  description: string;
  speaker_name: string;
};

type CastResult = { success: true } | { success: false; reason: 'budget' };

export const vote = (database: Database) => {
  const listTalks = async (): Promise<TalkRow[]> => {
    const { results } = await database
      .prepare(
        `SELECT t.id, t.title, t.description, s.name AS speaker_name
         FROM talks t
         JOIN speakers s ON s.id = t.speaker_id
         ORDER BY t.id`
      )
      .bind()
      .all<TalkRow>();
    return results;
  };

  const listUserVotes = async (userId: string): Promise<number[]> => {
    const { results } = await database
      .prepare('SELECT talk_id FROM c4p_votes WHERE user_id = ?')
      .bind(userId)
      .all<{ talk_id: number }>();
    return results.map((row) => row.talk_id);
  };

  const castVote = async (
    userId: string,
    talkId: number,
    budget: number
  ): Promise<CastResult> => {
    const current = await listUserVotes(userId);
    if (current.includes(talkId)) return { success: true };
    if (current.length >= budget) return { success: false, reason: 'budget' };

    await database
      .prepare(
        'INSERT OR IGNORE INTO c4p_votes (user_id, talk_id) VALUES (?, ?)'
      )
      .bind(userId, talkId)
      .run();

    return { success: true };
  };

  const removeVote = async (userId: string, talkId: number): Promise<void> => {
    await database
      .prepare('DELETE FROM c4p_votes WHERE user_id = ? AND talk_id = ?')
      .bind(userId, talkId)
      .run();
  };

  return { listTalks, listUserVotes, castVote, removeVote };
};
