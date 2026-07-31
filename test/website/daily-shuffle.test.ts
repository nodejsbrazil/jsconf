import { assert, describe, it } from 'poku';
import {
  localDayKey,
  orderTalks,
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

const PT_BR = 'pt-BR';
const SEED = 20260731;

// Accented initials on purpose: sorted by UTF-16 code unit these file after "Zebra", so the
// expected orders below only hold if the collator is actually doing the work.
const talks = [
  { id: 10, title: 'Zebra pattern em CSS' },
  { id: 20, title: 'Árvores de decisão' },
  { id: 30, title: 'Observabilidade sem sofrer' },
  { id: 40, title: 'Índices no D1' },
  { id: 50, title: 'Async no Node' },
];

const titlesOf = (ordered: readonly (typeof talks)[number][]) =>
  ordered.map((talk) => talk.title);
const idsOf = (ordered: readonly (typeof talks)[number][]) =>
  ordered.map((talk) => talk.id);

describe('orderTalks', () => {
  it('keeps the day-seeded shuffle when nothing has been voted for', () => {
    assert.deepStrictEqual(
      orderTalks(talks, [], PT_BR, SEED),
      seededShuffle(talks, SEED)
    );
  });

  it('keeps the incoming order when there is no seed to shuffle by', () => {
    assert.deepStrictEqual(orderTalks(talks, [], PT_BR, null), talks);
  });

  it('puts voted talks first, alphabetically among themselves', () => {
    const ordered = orderTalks(talks, [30, 50], PT_BR, SEED);
    assert.deepStrictEqual(titlesOf(ordered).slice(0, 2), [
      'Async no Node',
      'Observabilidade sem sofrer',
    ]);
  });

  it('sorts the non-voted tail alphabetically', () => {
    const ordered = orderTalks(talks, [30, 50], PT_BR, SEED);
    assert.deepStrictEqual(titlesOf(ordered).slice(2), [
      'Árvores de decisão',
      'Índices no D1',
      'Zebra pattern em CSS',
    ]);
  });

  it('collates accented titles where a pt-BR reader expects them', () => {
    const tail = orderTalks(talks, [10], PT_BR, SEED).slice(1);
    assert.deepStrictEqual(titlesOf(tail), [
      'Árvores de decisão',
      'Async no Node',
      'Índices no D1',
      'Observabilidade sem sofrer',
    ]);
    // The same titles compared as raw code units, which is the bug this guards against.
    assert.notDeepStrictEqual(
      titlesOf(tail),
      titlesOf(tail)
        .map((title) => ({ id: 0, title }))
        .sort((left, right) => (left.title < right.title ? -1 : 1))
        .map((talk) => talk.title)
    );
  });

  it('ignores the seed once a vote exists', () => {
    assert.deepStrictEqual(
      orderTalks(talks, [30], PT_BR, 1),
      orderTalks(talks, [30], PT_BR, 999999)
    );
  });

  it('is a permutation: nothing dropped, nothing duplicated', () => {
    const ordered = orderTalks(talks, [30, 50], PT_BR, SEED);
    assert.deepStrictEqual(
      idsOf(ordered).sort((a, b) => a - b),
      [10, 20, 30, 40, 50]
    );
  });

  it('leaves the input untouched', () => {
    const original = [...talks];
    orderTalks(talks, [30, 50], PT_BR, SEED);
    assert.deepStrictEqual(talks, original);
  });
});

describe('localDayKey', () => {
  it('formats the local date as YYYY-MM-DD with padding', () => {
    assert.strictEqual(localDayKey(new Date(2026, 0, 5)), '2026-01-05');
    assert.strictEqual(localDayKey(new Date(2026, 10, 30)), '2026-11-30');
  });
});
