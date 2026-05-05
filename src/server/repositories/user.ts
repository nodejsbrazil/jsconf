import type { Database } from '../types.js';
import { z } from 'zod';

const intEnum = (max: number) => z.number().int().min(0).max(max);

export const userSchema = z.object({
  email: z.email(),
  ticket_type: intEnum(10),
  votes_allowed: intEnum(100),
  quantity: intEnum(10),
});

const generateCode = () => String(Math.floor(1000 + Math.random() * 9000));

export const user = (database: Database) => {
  const schema = userSchema;

  const findByCode = async (code: string) => {
    const { results } = await database
      .prepare(
        'SELECT id, email, ticket_type, votes_allowed, quantity, code FROM users WHERE code = ?'
      )
      .bind(code)
      .all<{
        id: number;
        email: string;
        ticket_type: number;
        votes_allowed: number;
        quantity: number;
        code: string;
      }>();
    return results[0] || null;
  };

  const votesRemaining = async (userId: number) => {
    const { results } = await database
      .prepare('SELECT COUNT(*) as count FROM votes WHERE user_id = ?')
      .bind(userId)
      .all<{ count: number }>();
    return results[0]?.count ?? 0;
  };

  const insert = async (data: z.infer<typeof schema>) => {
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await database
        .prepare('SELECT id FROM users WHERE code = ?')
        .bind(code)
        .all<{ id: number }>();
      if (existing.results.length === 0) break;
      code = generateCode();
      attempts++;
    }
    await database
      .prepare(
        'INSERT INTO users (email, ticket_type, votes_allowed, quantity, code) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(
        data.email,
        data.ticket_type,
        data.votes_allowed,
        data.quantity ?? 1,
        code
      )
      .run();
    return code;
  };

  const insertBatch = async (items: z.infer<typeof schema>[]) => {
    const results: { email: string; code: string }[] = [];
    const usedCodes = new Set<string>();
    for (const item of items) {
      let code = generateCode();
      let attempts = 0;
      while (attempts < 10) {
        if (!usedCodes.has(code)) {
          const existing = await database
            .prepare('SELECT id FROM users WHERE code = ?')
            .bind(code)
            .all<{ id: number }>();
          if (existing.results.length === 0) break;
        }
        code = generateCode();
        attempts++;
      }
      usedCodes.add(code);
      await database
        .prepare(
          'INSERT INTO users (email, ticket_type, votes_allowed, quantity, code) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET ticket_type = excluded.ticket_type, votes_allowed = users.votes_allowed + excluded.votes_allowed, quantity = users.quantity + excluded.quantity, code = excluded.code'
        )
        .bind(
          item.email,
          item.ticket_type,
          item.votes_allowed,
          item.quantity ?? 1,
          code
        )
        .run();
      results.push({ email: item.email, code });
    }
    return results;
  };

  const revoke = async (email: string) => {
    const { results } = await database
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .all<{ id: number }>();

    const u = results[0];
    if (!u) return false;

    await database
      .prepare('DELETE FROM votes WHERE user_id = ?')
      .bind(u.id)
      .run();

    await database
      .prepare('UPDATE users SET votes_allowed = 0 WHERE id = ?')
      .bind(u.id)
      .run();

    return true;
  };

  const getEligibleTalks = async (userId?: number) => {
    const { results } = await database
      .prepare(
        `
        SELECT t.id, t.title, t.description, t.duration, t.audience_level,
               s.name as speaker_name,
               ${userId != null ? `CAST(EXISTS(SELECT 1 FROM votes v WHERE v.user_id = ? AND v.talk_id = t.id) AS INTEGER) as has_voted` : '0 as has_voted'}
        FROM talks t
        INNER JOIN speakers s ON t.speaker_id = s.id
        WHERE t.status = 2
      `
      )
      .bind(...(userId != null ? [userId] : []))
      .all<{
        id: number;
        title: string;
        description: string;
        duration: number;
        audience_level: number;
        speaker_name: string;
        has_voted: number;
      }>();
    return results;
  };

  const findByEmail = async (email: string) => {
    const { results } = await database
      .prepare(
        'SELECT id, email, ticket_type, votes_allowed, quantity, code FROM users WHERE email = ?'
      )
      .bind(email)
      .all<{
        id: number;
        email: string;
        ticket_type: number;
        votes_allowed: number;
        quantity: number;
        code: string;
      }>();
    return results[0] || null;
  };

  const findById = async (id: number) => {
    const { results } = await database
      .prepare(
        'SELECT id, email, ticket_type, votes_allowed, quantity FROM users WHERE id = ?'
      )
      .bind(id)
      .all<{
        id: number;
        email: string;
        ticket_type: number;
        votes_allowed: number;
        quantity: number;
      }>();
    return results[0] || null;
  };

  const setRefreshToken = async (
    email: string,
    tokenHash: string,
    expiresAt: number
  ) => {
    await database
      .prepare(
        'UPDATE users SET refresh_token_hash = ?, refresh_token_expires_at = ? WHERE email = ?'
      )
      .bind(tokenHash, expiresAt, email)
      .run();
  };

  const findByRefreshTokenHash = async (hash: string) => {
    const now = Math.floor(Date.now() / 1000);
    const { results } = await database
      .prepare(
        'SELECT id, email, ticket_type, votes_allowed, quantity FROM users WHERE refresh_token_hash = ? AND refresh_token_expires_at > ?'
      )
      .bind(hash, now)
      .all<{
        id: number;
        email: string;
        ticket_type: number;
        votes_allowed: number;
        quantity: number;
      }>();
    return results[0] || null;
  };

  const clearRefreshToken = async (userId: number) => {
    await database
      .prepare(
        'UPDATE users SET refresh_token_hash = NULL, refresh_token_expires_at = NULL WHERE id = ?'
      )
      .bind(userId)
      .run();
  };

  return {
    schema,
    findByCode,
    votesRemaining,
    insert,
    insertBatch,
    revoke,
    getEligibleTalks,
    findByEmail,
    findById,
    setRefreshToken,
    findByRefreshTokenHash,
    clearRefreshToken,
  };
};
