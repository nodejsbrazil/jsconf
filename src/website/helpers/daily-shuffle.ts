// Per-visitor, per-day ordering for lists where being on top is an unfair advantage (the C4P
// vote). The seed lives in a cookie next to the day it was minted, so the order holds for the
// whole day and rolls over on the next one. Nothing here is a secret: the seed only decides who
// sees which talk first.

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
 * Reorders a list per visitor, stable for the day. Presentation only — call it where the data
 * lands, never in a way that lets a position stand in for an item's identity.
 */
export const dailyShuffle = <T>(items: readonly T[]): T[] => {
  const seed = readDaySeed();
  if (seed === null) return [...items];
  return seededShuffle(items, seed);
};
