import type {
  AnimationRefs,
  AnimationState,
} from '@site/src/hooks/Background/types';
import {
  isStarOutOfBounds,
  recycleStar,
} from '@site/src/hooks/Background/stars';
import { stopAnimationFrame } from '@site/src/hooks/shared/animation';

const updateVelocity = (state: AnimationState): void => {
  const { velocity, config } = state;
  const { friction, responsiveness } = config;

  velocity.targetX *= friction;
  velocity.targetY *= friction;

  velocity.x += (velocity.targetX - velocity.x) * responsiveness;
  velocity.y += (velocity.targetY - velocity.y) * responsiveness;
};

const updateStars = (state: AnimationState): void => {
  const { stars, velocity, dimensions, config } = state;
  const { width, height } = dimensions;
  const { overflowThreshold } = config;

  const centerX = width / 2;
  const centerY = height / 2;

  for (const star of stars) {
    star.x += velocity.x * star.z;
    star.y += velocity.y * star.z;

    star.x += (star.x - centerX) * velocity.zoom * star.z;
    star.y += (star.y - centerY) * velocity.zoom * star.z;
    star.z += velocity.zoom;

    if (isStarOutOfBounds(star, width, height, overflowThreshold))
      recycleStar(star, state);
  }
};

const renderStars = (
  context: CanvasRenderingContext2D,
  state: AnimationState
): void => {
  const { stars, velocity, dimensions, config } = state;
  const { scale } = dimensions;
  const { starSize, starColor } = config;

  context.lineCap = 'round';
  context.strokeStyle = starColor;

  for (const star of stars) {
    context.beginPath();

    context.lineWidth = starSize * star.z * scale;
    context.globalAlpha = 0.5 + 0.5 * Math.random();

    context.moveTo(star.x, star.y);

    let tailX = velocity.x * 2;
    let tailY = velocity.y * 2;

    if (Math.abs(tailX) < 0.1) tailX = 0.5;
    if (Math.abs(tailY) < 0.1) tailY = 0.5;

    context.lineTo(star.x + tailX, star.y + tailY);
    context.stroke();
  }
};

const clearCanvas = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  context.clearRect(0, 0, width, height);
};

const createAnimationLoop = (
  canvas: HTMLCanvasElement,
  state: AnimationState,
  refs: AnimationRefs
) => {
  const animate = (): void => {
    const context = canvas.getContext('2d');
    if (!context) return;

    const { width, height } = state.dimensions;

    clearCanvas(context, width, height);
    updateVelocity(state);
    updateStars(state);
    renderStars(context, state);

    refs.animationFrameId = requestAnimationFrame(animate);
  };

  return animate;
};

export const startAnimation = (
  canvas: HTMLCanvasElement,
  state: AnimationState,
  refs: AnimationRefs
): void => {
  stopAnimationFrame(refs);

  const animate = createAnimationLoop(canvas, state, refs);

  refs.animationFrameId = requestAnimationFrame(animate);
};
