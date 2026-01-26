export type Dot = {
  centerX: number;
  centerY: number;
  radius: number;
};

export type DotState = {
  dot: Dot;
  visible: boolean;
  appearAt: number;
  disappearAt: number | null;
};

export type AnimationState = {
  dots: DotState[];
  nextDelay: number;
  nextRemovalAt: number | null;
};

export type AnimationRefs = {
  requestAnimationFrameId: number;
  lastFrameTime: number;
  elapsedBeforePause: number;
  pauseTime: number | null;
  startTime: number | null;
  resizeObserver: ResizeObserver | null;
};

export type RawDotData = {
  cx: number;
  cy: number;
  r: number;
};

export type DotProgressResult = {
  progress: number;
  visible: boolean;
  disappearAt: number | null;
};
