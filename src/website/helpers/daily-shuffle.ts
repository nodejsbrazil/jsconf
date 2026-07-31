// Ordering for the C4P vote list, where being on top is an unfair advantage. A visitor who has
// not voted gets a shuffle seeded per visitor per day: the seed lives in a cookie next to the day
// it was minted, so the order holds for the whole day and rolls over on the next one. Nothing
// here is a secret — the seed only decides who sees which talk first.

const COOKIE_NAME = 'jsconf_order_seed';
// Two days, so the cookie outlives a session that starts late at night. The stored day (not the
// expiry) is what decides whether the seed is still good.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 2;

/**
 * `YYYY-MM-DD` in the visitor's own timezone — the day they think it is, not UTC's. Crossing
 * midnight mid-session just reshuffles, which is fine.
 */
export const localDayKey = (date: Date = new Date()): string => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

// mulberry32: a 32-bit seeded PRNG small enough to inline. Not cryptographic, plenty for a
// shuffle. `state` has to be mutable — that is the whole point of a generator.
const mulberry32 = (seed: number): (() => number) => {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    const mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    const folded =
      (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((folded ^ (folded >>> 14)) >>> 0) / 4294967296;
  };
};

/** Fisher-Yates driven by the seeded PRNG: same seed in, same permutation out. */
export const seededShuffle = <T>(items: readonly T[], seed: number): T[] => {
  const random = mulberry32(seed);
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    const held = shuffled[index]!;
    shuffled[index] = shuffled[target]!;
    shuffled[target] = held;
  }
  return shuffled;
};

/**
 * Today's seed, minting and storing a new one when the cookie is missing or was written on a
 * different day. Returns `null` when there is no `document` (Docusaurus renders these pages at
 * build time) so callers can fall back to the original order instead of crashing the build.
 */
export const readDaySeed = (today: string = localDayKey()): number | null => {
  if (typeof document === 'undefined') return null;

  const stored = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  const [day, rawSeed] = stored?.split('.') ?? [];
  const seed = day === today ? Number.parseInt(rawSeed ?? '', 10) : Number.NaN;
  if (Number.isFinite(seed)) return seed;

  const fresh = Math.floor(Math.random() * 2 ** 32);
  document.cookie = `${COOKIE_NAME}=${today}.${fresh}; path=/; SameSite=Lax; max-age=${COOKIE_MAX_AGE}`;
  return fresh;
};

/**
 * The vote list's order. Presentation only — resolve it once where the data lands, never anywhere
 * a rendered position could stand in for a talk's identity.
 *
 * Two rules, and which one applies is decided by whether the visitor arrives with votes already
 * cast. `seed === null` means there was no `document` to read a cookie from (the build-time
 * render), in which case the incoming order stands.
 */
export const orderTalks = <T extends { id: number; title: string }>(
  talks: readonly T[],
  votedIds: readonly number[],
  locale: string,
  seed: number | null
): T[] => {
  // Nothing voted for yet, so the shuffle is doing its job: don't disturb it.
  if (votedIds.length === 0) {
    return seed === null ? [...talks] : seededShuffle(talks, seed);
  }

  // Already voted, so the shuffle has served its purpose and their picks pin to the top instead.
  // Both groups sort by title, which keeps the two halves reading the same way and keeps the
  // order independent of when any single vote was cast.
  const voted = new Set(votedIds);
  // Titles are Brazilian Portuguese. A plain `<` compares UTF-16 code units, which files "Árvore"
  // after "Zebra"; a collator on the active locale puts the accents where a reader of that locale
  // expects them.
  const collator = new Intl.Collator(locale);
  const byTitle = (left: T, right: T) =>
    collator.compare(left.title, right.title);

  return [
    ...talks.filter((talk) => voted.has(talk.id)).sort(byTitle),
    ...talks.filter((talk) => !voted.has(talk.id)).sort(byTitle),
  ];
};
