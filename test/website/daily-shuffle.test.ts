import { assert, describe, it } from 'poku';
import {
  localDayKey,
  seededShuffle,
} from '../../src/website/helpers/daily-shuffle';

const talkIds = Array.from({ length: 24 }, (_, index) => index + 1);

describe('seededShuffle', () => {
  it('same seed produces the same order', () => {
    assert.deepStrictEqual(
      seededShuffle(talkIds, 20260731),
      seededShuffle(talkIds, 20260731)
    );
  });

  it('different seeds produce different orders', () => {
    assert.notDeepStrictEqual(
      seededShuffle(talkIds, 20260731),
      seededShuffle(talkIds, 20260801)
    );
  });

  it('reorders the list instead of leaving it alone', () => {
    assert.notDeepStrictEqual(seededShuffle(talkIds, 7), talkIds);
  });

  it('is a permutation: nothing dropped, nothing duplicated', () => {
    const shuffled = seededShuffle(talkIds, 1337);
    assert.strictEqual(shuffled.length, talkIds.length);
    assert.deepStrictEqual(
      [...shuffled].sort((a, b) => a - b),
      talkIds
    );
  });

  it('leaves the input untouched', () => {
    const original = [...talkIds];
    seededShuffle(talkIds, 99);
    assert.deepStrictEqual(talkIds, original);
  });
});

describe('localDayKey', () => {
  it('formats the local date as YYYY-MM-DD with padding', () => {
    assert.strictEqual(localDayKey(new Date(2026, 0, 5)), '2026-01-05');
    assert.strictEqual(localDayKey(new Date(2026, 10, 30)), '2026-11-30');
  });
});
