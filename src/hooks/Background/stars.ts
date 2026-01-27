import type {
  AnimationState,
  RecycleDirection,
  Star,
} from '@site/src/hooks/Background/types';

export const createStar = (minScale: number): Star => ({
  x: 0,
  y: 0,
  z: minScale + Math.random() * (1 - minScale),
});

export const createStars = (count: number, minScale: number): Star[] =>
  Array.from({ length: count }, () => createStar(minScale));

export const placeStar = (star: Star, width: number, height: number): void => {
  star.x = Math.random() * width;
  star.y = Math.random() * height;
};

export const placeAllStars = (
  stars: Star[],
  width: number,
  height: number
): void => {
  for (const star of stars) placeStar(star, width, height);
};

const determineRecycleDirection = (
  velocityX: number,
  velocityY: number
): RecycleDirection => {
  const absVelocityX = Math.abs(velocityX);
  const absVelocityY = Math.abs(velocityY);

  const hasSignificantVelocity = absVelocityX > 1 || absVelocityY > 1;
  if (!hasSignificantVelocity) return 'center';

  const isHorizontalDominant =
    absVelocityX > absVelocityY
      ? Math.random() < absVelocityX / (absVelocityX + absVelocityY)
      : Math.random() >= absVelocityY / (absVelocityX + absVelocityY);

  if (isHorizontalDominant) return velocityX > 0 ? 'left' : 'right';
  return velocityY > 0 ? 'top' : 'bottom';
};

export const recycleStar = (star: Star, state: AnimationState): void => {
  const { velocity, dimensions, config } = state;
  const { width, height } = dimensions;
  const { overflowThreshold, starMinScale } = config;

  const direction = determineRecycleDirection(velocity.x, velocity.y);

  star.z = starMinScale + Math.random() * (1 - starMinScale);

  switch (direction) {
    case 'center':
      star.z = 0.1;
      star.x = Math.random() * width;
      star.y = Math.random() * height;
      break;
    case 'left':
      star.x = -overflowThreshold;
      star.y = Math.random() * height;
      break;
    case 'right':
      star.x = width + overflowThreshold;
      star.y = Math.random() * height;
      break;
    case 'top':
      star.x = Math.random() * width;
      star.y = -overflowThreshold;
      break;
    case 'bottom':
      star.x = Math.random() * width;
      star.y = height + overflowThreshold;
      break;
  }
};

export const isStarOutOfBounds = (
  star: Star,
  width: number,
  height: number,
  threshold: number
): boolean =>
  star.x < -threshold ||
  star.x > width + threshold ||
  star.y < -threshold ||
  star.y > height + threshold;
