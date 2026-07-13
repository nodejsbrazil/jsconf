import type { Database } from '../types.js';
import { VOTABLE_TALK_STATUS } from '../configs/vote.js';

export type TalkRow = {
  id: number;
  title: string;
  description: string;
  duration: number;
  audience_level: number;
};

type CastResult =
  | { success: true }
  | { success: false; reason: 'budget' | 'invalid_talk' };

export const vote = (database: Database) => {
  const listTalks = async (): Promise<TalkRow[]> => {
    // No speaker join: the API must never expose who proposed a talk, to keep voting unbiased.
    // The frontend shows a fake blurred placeholder name instead, generated client-side.
    const { results } = await database
      .prepare(
        `SELECT id, title, description, duration, audience_level
         FROM talks
         WHERE status = ?
         ORDER BY id`
      )
      .bind(VOTABLE_TALK_STATUS)
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
    // Only votable talks accept votes: rejects hidden/pending/rejected talk ids and avoids the
    // talks(id) FK blowing up on nonexistent ids.
    const { results: votable } = await database
      .prepare('SELECT 1 FROM talks WHERE id = ? AND status = ?')
      .bind(talkId, VOTABLE_TALK_STATUS)
      .all();
    if (!votable.length) return { success: false, reason: 'invalid_talk' };

    const current = await listUserVotes(userId);
    if (current.includes(talkId)) return { success: true };
    if (current.length >= budget) return { success: false, reason: 'budget' };

    // Budget re-check lives inside the INSERT so two concurrent votes can't both pass the read
    // above and overspend: the row is only written while the user is still under budget.
    await database
      .prepare(
        `INSERT OR IGNORE INTO c4p_votes (user_id, talk_id)
         SELECT ?1, ?2
         WHERE (SELECT COUNT(*) FROM c4p_votes WHERE user_id = ?1) < ?3`
      )
      .bind(userId, talkId, budget)
      .run();

    // A lost budget race leaves the guarded INSERT a no-op; confirm the vote actually landed.
    const after = await listUserVotes(userId);
    if (!after.includes(talkId)) return { success: false, reason: 'budget' };
    return { success: true };
  };

  const removeVote = async (userId: string, talkId: number): Promise<void> => {
    await database
      .prepare('DELETE FROM c4p_votes WHERE user_id = ? AND talk_id = ?')
      .bind(userId, talkId)
      .run();
  };

  // Vote budget for a guild.host tier name. Unlisted tier → 1 (every ticket holder gets a vote by
  // default; ticket_tiers only stores overrides).
  const budgetForTier = async (tier: string): Promise<number> => {
    const { results } = await database
      .prepare('SELECT budget FROM ticket_tiers WHERE name = ?')
      .bind(tier)
      .all<{ budget: number }>();
    // Any ticket holder gets 1 vote by default; ticket_tiers only stores the overrides (e.g. a
    // higher budget for earlier tiers). The caller already gated non-attendees out.
    return results[0]?.budget ?? 1;
  };

  return { listTalks, listUserVotes, castVote, removeVote, budgetForTier };
};
