// Hardcoded voting window. Move to an Env var only if the date needs changing without a deploy.
// Open through the whole of 2026-11-01 in Brasília time (UTC-3, no daylight saving since 2019).
export const VOTE_CLOSES_AT = '2026-11-02T03:00:00Z';

export const isVotingOpen = (now: Date = new Date()): boolean =>
  now < new Date(VOTE_CLOSES_AT);

export const VOTABLE_TALK_STATUS = 2;
