import type { BackgroundConfig } from '@site/src/website/hooks/Background/types';

export const DEFAULT_CONFIG: BackgroundConfig = {
  starColor: '#ffffff',
  starSize: 3,
  starMinScale: 0.2,
  starCount: 0,
  overflowThreshold: 50,
  intensity: 0.15,
  zoomSpeed: 0.0005,
  friction: 0.96,
  responsiveness: 0.8,
};

export const calculateStarCount = (width: number, height: number): number =>
  Math.floor((width + height) / 8);
