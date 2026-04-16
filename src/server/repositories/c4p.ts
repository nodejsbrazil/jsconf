import type { Database } from '../types.js';
import { z } from 'zod';

export type C4P = ReturnType<typeof c4p>;

const intEnum = (max: number) =>
  z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.coerce.number().int().min(0).max(max)
  );

const optionalIntEnum = (max: number, defaultValue: number) =>
  z.preprocess(
    (val) =>
      val === '' || val === undefined || val === null ? defaultValue : val,
    z.coerce.number().int().min(0).max(max)
  );

export const c4p = (database: Database) => {
  const talkLimit = 3;

  const schema = z.object({
    name: z.string().trim().min(1),
    email: z.string().trim().pipe(z.email().max(254)),
    phone: z.string().trim().min(8),
    city: z.string().trim().min(1),
    state: z.string().trim().length(2),
    travelPreference: intEnum(1),
    experienceLevel: intEnum(3),
    bio: z.string().trim().min(1).max(280),
    linkedin: z.string().trim().default(''),
    instagram: z.string().trim().default(''),
    youtube: z.string().trim().default(''),
    github: z.string().trim().default(''),
    website: z.string().trim().default(''),
    gender: optionalIntEnum(3, 3),
    race: optionalIntEnum(6, 6),
    disability: optionalIntEnum(5, 5),
    duration: intEnum(1),
    talkTitle: z.string().trim().min(1),
    talkDescription: z.string().trim().min(1),
    audienceLevel: intEnum(3),
    talkReason: z.string().trim().min(1),
    confirm_email: z.string().default(''),
  });

  type SubmitResult =
    | { success: true }
    | { success: false; reason: 'talk_limit' | 'internal' };

  const submit = async (
    data: z.infer<typeof schema>,
    ip: string
  ): Promise<SubmitResult> => {
    try {
      await database
        .prepare(
          `INSERT INTO speakers (name, email, phone, city, state, travel_pref, linkedin, instagram, youtube, github, website, experience, bio, ip)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(email) DO UPDATE SET
             name = excluded.name,
             phone = excluded.phone,
             city = excluded.city,
             state = excluded.state,
             travel_pref = excluded.travel_pref,
             linkedin = excluded.linkedin,
             instagram = excluded.instagram,
             youtube = excluded.youtube,
             github = excluded.github,
             website = excluded.website,
             experience = excluded.experience,
             bio = excluded.bio,
             ip = excluded.ip,
             updated_at = datetime('now')`
        )
        .bind(
          data.name,
          data.email,
          data.phone,
          data.city,
          data.state,
          data.travelPreference,
          data.linkedin,
          data.instagram,
          data.youtube,
          data.github,
          data.website,
          data.experienceLevel,
          data.bio,
          ip
        )
        .run();

      const { results: speakers } = await database
        .prepare('SELECT id FROM speakers WHERE email = ?')
        .bind(data.email)
        .all<{ id: number }>();

      const speakerId = speakers[0]?.id;
      if (!speakerId) return { success: false, reason: 'internal' };

      const { results: talks } = await database
        .prepare('SELECT COUNT(*) as total FROM talks WHERE speaker_id = ?')
        .bind(speakerId)
        .all<{ total: number }>();

      if ((talks[0]?.total ?? 0) >= talkLimit)
        return { success: false, reason: 'talk_limit' };

      await database
        .prepare(
          `INSERT INTO speaker_diversity (speaker_id, gender, race, disability)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(speaker_id) DO UPDATE SET
             gender = excluded.gender,
             race = excluded.race,
             disability = excluded.disability,
             consented_at = datetime('now')`
        )
        .bind(speakerId, data.gender, data.race, data.disability)
        .run();

      await database
        .prepare(
          'INSERT INTO talks (speaker_id, duration, title, description, audience_level, reason) VALUES (?, ?, ?, ?, ?, ?)'
        )
        .bind(
          speakerId,
          data.duration,
          data.talkTitle,
          data.talkDescription,
          data.audienceLevel,
          data.talkReason
        )
        .run();

      return { success: true };
    } catch {
      return { success: false, reason: 'internal' };
    }
  };

  return { schema, submit };
};
