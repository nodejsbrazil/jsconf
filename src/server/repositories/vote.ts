import type { Database } from '../types.js';
import { VOTABLE_TALK_STATUS } from '../configs/vote.js';

export type TalkRow = {
  id: number;
  title: string;
  description: string;
  duration: number;
  audience_level: number;
};

export type TalkVoteCount = { talk_id: number; title: string; votes: number };

export type VoteRow = {
  user_id: string;
  created_at: string;
  position: number;
};

export type AuditAction = 'remove';

export type AuditEntry = {
  actorId: string;
  actorName?: string | undefined;
  action: AuditAction;
  userId: string;
  talkId: number;
};

export type AuditRow = {
  actor_id: string;
  actor_name: string | null;
  action: AuditAction;
  user_id: string;
  talk_id: number;
  title: string | null;
  created_at: string;
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

  // Dashboard summary: every votable talk with its vote count, busiest first. Still no speaker
  // join, for the same reason listTalks has none.
  const talkVoteCounts = async (): Promise<TalkVoteCount[]> => {
    const { results } = await database
      .prepare(
        `SELECT t.id AS talk_id, t.title, COUNT(v.id) AS votes
         FROM talks t
         LEFT JOIN c4p_votes v ON v.talk_id = t.id
         WHERE t.status = ?
         GROUP BY t.id, t.title
         ORDER BY votes DESC, t.id`
      )
      .bind(VOTABLE_TALK_STATUS)
      .all<TalkVoteCount>();
    return results;
  };

  // One row per vote on a talk. `position` is where this vote falls in that voter's own timeline
  // (their 1st, 2nd, ...), which the dashboard renders as "2 of 5" against their tier's budget.
  const votesForTalk = async (talkId: number): Promise<VoteRow[]> => {
    const { results } = await database
      .prepare(
        `SELECT user_id, created_at, position FROM (
           SELECT user_id, talk_id, created_at,
                  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at, id) AS position
           FROM c4p_votes
         )
         WHERE talk_id = ?
         ORDER BY created_at`
      )
      .bind(talkId)
      .all<VoteRow>();
    return results;
  };

  // Every tier override at once, for the dashboard's per-voter budget column. Callers apply the
  // same default budgetForTier uses: a tier with no row here is worth 1 vote.
  const tierBudgets = async (): Promise<Map<string, number>> => {
    const { results } = await database
      .prepare('SELECT name, budget FROM ticket_tiers')
      .bind()
      .all<{ name: string; budget: number }>();
    return new Map(results.map((row) => [row.name, row.budget]));
  };

  const recordAudit = async (entry: AuditEntry): Promise<void> => {
    await database
      .prepare(
        `INSERT INTO c4p_vote_audit (actor_id, actor_name, action, user_id, talk_id)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(
        entry.actorId,
        entry.actorName ?? null,
        entry.action,
        entry.userId,
        entry.talkId
      )
      .run();
  };

  // Newest first, capped, joined to the talk title so the log reads without a second lookup.
  const listAudit = async (limit: number = 100): Promise<AuditRow[]> => {
    const { results } = await database
      .prepare(
        `SELECT a.actor_id, a.actor_name, a.action, a.user_id, a.talk_id,
                a.created_at, t.title
         FROM c4p_vote_audit a
         LEFT JOIN talks t ON t.id = a.talk_id
         ORDER BY a.created_at DESC, a.id DESC
         LIMIT ?`
      )
      .bind(limit)
      .all<AuditRow>();
    return results;
  };

  return {
    listTalks,
    listUserVotes,
    castVote,
    removeVote,
    budgetForTier,
    talkVoteCounts,
    votesForTalk,
    tierBudgets,
    recordAudit,
    listAudit,
  };
};
