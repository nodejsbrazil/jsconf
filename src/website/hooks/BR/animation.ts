import type {
  AnimationRefs,
  AnimationState,
} from '@site/src/website/hooks/BR/types';
import { draw } from '@site/src/website/hooks/BR/canvas';
import {
  FINAL_COLOR,
  INITIAL_COLOR,
} from '@site/src/website/hooks/BR/definitions';
import {
  initializeResizeObserver,
  stopAnimationFrame,
} from '@site/src/website/hooks/shared/animation';

const easeIn = (progress: number): number => progress * progress;

const lerp = (start: number, end: number, progress: number): number =>
  start + (end - start) * progress;

export const getColor = (progress: number): string => {
  const easedProgress = easeIn(Math.min(1, Math.max(0, progress)));
  const red = Math.round(
    lerp(INITIAL_COLOR.red, FINAL_COLOR.red, easedProgress)
  );
  const green = Math.round(
    lerp(INITIAL_COLOR.green, FINAL_COLOR.green, easedProgress)
  );
  const blue = Math.round(
    lerp(INITIAL_COLOR.blue, FINAL_COLOR.blue, easedProgress)
  );
  const alpha = lerp(INITIAL_COLOR.alpha, FINAL_COLOR.alpha, easedProgress);

  return `rgba(${red},${green},${blue},${alpha})`;
};

const createAnimationLoop = (
  canvas: HTMLCanvasElement,
  animation: AnimationRefs,
  state: AnimationState
) => {
  const animate = (timestamp: number) => {
    const context = canvas.getContext('2d');
    if (!context) return;

    animation.startTime ??= timestamp;

    const shouldRenderFrame = timestamp - animation.lastFrameTime >= 16;
    if (shouldRenderFrame) {
      const elapsed =
        timestamp - animation.startTime + animation.elapsedBeforePause;
      draw(context, canvas, state, elapsed);
      animation.lastFrameTime = timestamp;
    }

    animation.animationFrameId = requestAnimationFrame(animate);
  };

  return animate;
};

const resetPauseState = (animation: AnimationRefs): void => {
  if (animation.pauseTime === null) return;

  animation.startTime = null;
  animation.pauseTime = null;
};

const savePauseState = (animation: AnimationRefs): void => {
  const canSavePauseState =
    animation.startTime !== null && animation.pauseTime === null;
  if (!canSavePauseState) return;

  animation.elapsedBeforePause += performance.now() - animation.startTime!;
  animation.pauseTime = performance.now();
  animation.startTime = null;
};

const startAnimationLoop = (
  canvas: HTMLCanvasElement,
  animation: AnimationRefs,
  state: AnimationState,
  handleResize: () => void
): void => {
  const animate = createAnimationLoop(canvas, animation, state);

  stopAnimationFrame(animation);
  requestAnimationFrame(() => {
    handleResize();
    animation.animationFrameId = requestAnimationFrame(animate);
  });
};

export const handleVisibilityOn = (
  canvas: HTMLCanvasElement,
  animation: AnimationRefs,
  state: AnimationState,
  handleResize: () => void
): void => {
  resetPauseState(animation);
  initializeResizeObserver(canvas, animation, handleResize);
  startAnimationLoop(canvas, animation, state, handleResize);
};

export const handleVisibilityOff = (animation: AnimationRefs): void => {
  savePauseState(animation);
  stopAnimationFrame(animation);
};

export const createElapsedTimeGetter =
  (animation: AnimationRefs) => (): number => {
    if (animation.startTime === null) return 0;

    return (
      performance.now() - animation.startTime + animation.elapsedBeforePause
    );
  };
