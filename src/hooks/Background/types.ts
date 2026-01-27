export type Star = {
  x: number;
  y: number;
  z: number;
};

export type RecycleDirection = 'center' | 'left' | 'right' | 'top' | 'bottom';

export type Velocity = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  zoom: number;
};

export type Pointer = {
  x: number | null;
  y: number | null;
  isTouch: boolean;
};

export type CanvasDimensions = {
  width: number;
  height: number;
  scale: number;
};

export type BackgroundConfig = {
  starColor: string;
  starSize: number;
  starMinScale: number;
  starCount: number;
  overflowThreshold: number;
  intensity: number;
  zoomSpeed: number;
  friction: number;
  responsiveness: number;
};

export type AnimationState = {
  stars: Star[];
  velocity: Velocity;
  pointer: Pointer;
  dimensions: CanvasDimensions;
  config: BackgroundConfig;
};

export type AnimationRefs = {
  animationFrameId: number;
  resizeObserver: ResizeObserver | null;
};

export type UseBackgroundOptions = Partial<BackgroundConfig>;
