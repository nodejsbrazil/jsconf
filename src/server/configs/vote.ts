// ponytail: hardcoded voting window. Move to an Env var only if the date needs changing
// without a deploy.
export const VOTE_CLOSES_AT = '2026-09-01T00:00:00Z';

export const isVotingOpen = (now: Date = new Date()): boolean =>
  now < new Date(VOTE_CLOSES_AT);
