import type { AnimationState, Dot } from '@site/src/website/hooks/BR/types';
import { getColor } from '@site/src/website/hooks/BR/animation';
import { VIEWBOX_WIDTH } from '@site/src/website/hooks/BR/definitions';
import {
  calculateDotProgress,
  processRemovals,
} from '@site/src/website/hooks/BR/helpers';

const drawSquare = (
  context: CanvasRenderingContext2D,
  dot: Dot,
  progress: number,
  scale: number
): void => {
  const color = getColor(progress);
  const size = dot.radius * 2 * scale;
  const x = dot.centerX * scale - size / 2;
  const y = dot.centerY * scale - size / 2;
  const borderRadius = size * 0.2;

  context.fillStyle = color;
  context.beginPath();
  context.roundRect(x, y, size, size, borderRadius);
  context.fill();
};

export const draw = (
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: AnimationState,
  elapsed: number
): void => {
  if (canvas.width === 0 || canvas.height === 0) return;

  const visibleIndices: number[] = [];
  const scale = canvas.width / VIEWBOX_WIDTH;

  let visibleCount = 0;

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let dotIndex = 0; dotIndex < state.dots.length; dotIndex++) {
    const dotState = state.dots[dotIndex];
    if (!dotState) continue;

    const result = calculateDotProgress(dotState, elapsed);

    dotState.visible = result.visible;
    dotState.disappearAt = result.disappearAt;

    if (result.progress > 0) {
      visibleCount++;

      const isStableVisible = result.visible && result.disappearAt === null;
      if (isStableVisible) {
        visibleIndices.push(dotIndex);
      }
    }

    drawSquare(context, dotState.dot, result.progress, scale);
  }

  processRemovals(state, visibleIndices, visibleCount, elapsed);
};

export const updateCanvasSize = (
  canvas: HTMLCanvasElement,
  state: AnimationState,
  getElapsed: () => number
): void => {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;

  const context = canvas.getContext('2d');
  if (context) {
    draw(context, canvas, state, getElapsed());
  }
};
