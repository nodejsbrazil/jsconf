// Hardcoded voting window. Move to an Env var only if the date needs changing without a deploy.
// Closed early: the event was cancelled on 2026-10-05. It was meant to run through 2026-11-01
// in Brasília time (2026-11-02T03:00:00Z).
export const VOTE_CLOSES_AT = '2026-10-06T00:00:00Z';

export const isVotingOpen = (now: Date = new Date()): boolean =>
  now < new Date(VOTE_CLOSES_AT);

export const VOTABLE_TALK_STATUS = 2;
