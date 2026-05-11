import type {
  AnimationState,
  Dot,
  DotProgressResult,
  DotState,
  RawDotData,
} from '@site/src/website/hooks/BR/types';
import {
  ANIMATION_DURATION,
  DELAY_PER_DOT,
  MAX_DOTS,
  VISIBLE_THRESHOLD,
} from '@site/src/website/hooks/BR/definitions';
import dots from '@site/src/website/hooks/BR/dots.json';

const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];

  for (let currentIndex = result.length - 1; currentIndex > 0; currentIndex--) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));

    const currentValue = result[currentIndex];
    const randomValue = result[randomIndex];

    if (currentValue !== undefined && randomValue !== undefined) {
      result[currentIndex] = randomValue;
      result[randomIndex] = currentValue;
    }
  }

  return result;
};

const mapRawDotToDot = (rawDot: RawDotData): Dot => ({
  centerX: rawDot.cx,
  centerY: rawDot.cy,
  radius: rawDot.r,
});

const createHiddenProgress = (): DotProgressResult => ({
  progress: 0,
  visible: false,
  disappearAt: null,
});

const createVisibleProgress = (): DotProgressResult => ({
  progress: 1,
  visible: true,
  disappearAt: null,
});

const calculateDisappearingProgress = (
  elapsed: number,
  disappearAt: number,
  visible: boolean
): DotProgressResult | null => {
  if (disappearAt === null) return null;

  const timeSinceDisappear = elapsed - disappearAt;
  const hasFinishedDisappearing = timeSinceDisappear >= ANIMATION_DURATION;

  if (hasFinishedDisappearing) return createHiddenProgress();

  return {
    progress: 1 - timeSinceDisappear / ANIMATION_DURATION,
    visible,
    disappearAt,
  };
};

const calculateAppearingProgress = (
  elapsed: number,
  appearAt: number
): DotProgressResult => {
  const timeSinceAppear = elapsed - appearAt;

  const hasNotStartedAppearing = timeSinceAppear <= 0;
  if (hasNotStartedAppearing) return createHiddenProgress();

  const hasFinishedAppearing = timeSinceAppear >= ANIMATION_DURATION;
  if (hasFinishedAppearing) return createVisibleProgress();

  return {
    progress: timeSinceAppear / ANIMATION_DURATION,
    visible: false,
    disappearAt: null,
  };
};

export const calculateDotProgress = (
  dotState: DotState,
  elapsed: number
): DotProgressResult => {
  const { visible, appearAt, disappearAt } = dotState;

  const disappearingProgress = calculateDisappearingProgress(
    elapsed,
    disappearAt!,
    visible
  );
  if (disappearingProgress) return disappearingProgress;

  if (visible) return createVisibleProgress();

  return calculateAppearingProgress(elapsed, appearAt);
};

const MAX_REMOVALS_PER_FRAME = 10;

const scheduleDotsForRemoval = (
  state: AnimationState,
  visibleIndices: number[],
  elapsed: number
): void => {
  state.nextRemovalAt ??= elapsed;

  let iterations = 0;
  while (
    state.nextRemovalAt <= elapsed &&
    visibleIndices.length > 0 &&
    iterations < MAX_REMOVALS_PER_FRAME
  ) {
    const randomIndex = Math.floor(Math.random() * visibleIndices.length);
    const dotIndex = visibleIndices.splice(randomIndex, 1)[0];
    const dot = dotIndex !== undefined ? state.dots[dotIndex] : undefined;

    if (dot) {
      dot.disappearAt = state.nextRemovalAt;
      dot.appearAt = state.nextDelay;
    }

    state.nextDelay += DELAY_PER_DOT;
    state.nextRemovalAt += DELAY_PER_DOT;
    iterations++;
  }
};

const resetRemovalSchedule = (state: AnimationState): void => {
  state.nextRemovalAt = null;
};

export const processRemovals = (
  state: AnimationState,
  visibleIndices: number[],
  visibleCount: number,
  elapsed: number
): void => {
  const shouldScheduleRemovals =
    visibleCount >= VISIBLE_THRESHOLD && visibleIndices.length > 0;
  const shouldResetSchedule = visibleCount < VISIBLE_THRESHOLD;

  if (shouldScheduleRemovals) {
    scheduleDotsForRemoval(state, visibleIndices, elapsed);
    return;
  }

  if (shouldResetSchedule) {
    resetRemovalSchedule(state);
  }
};

// Uniform sampling: picks every (total/count)th dot so the "BR" shape stays
// evenly filled rather than leaving gaps in one region.
const sampleDots = (allDots: RawDotData[], count: number): RawDotData[] => {
  const step = allDots.length / count;
  return Array.from(
    { length: count },
    (_, i) => allDots[Math.round(i * step)]!
  );
};

export const createInitialState = (): AnimationState => {
  const sampled = sampleDots(dots as RawDotData[], MAX_DOTS);
  const indices = shuffleArray(
    Array.from({ length: sampled.length }, (_, index) => index)
  );

  return {
    dots: sampled.map((rawDot, index) => ({
      dot: mapRawDotToDot(rawDot),
      visible: false,
      appearAt: (indices[index] ?? index) * DELAY_PER_DOT,
      disappearAt: null,
    })),
    nextDelay: sampled.length * DELAY_PER_DOT,
    nextRemovalAt: null,
  };
};
