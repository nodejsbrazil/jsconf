import { useRef } from 'react';
import { cleanupAnimation } from '../shared/animation';
import { useVisibility } from '../useVisibility';
import {
  createElapsedTimeGetter,
  handleVisibilityOff,
  handleVisibilityOn,
} from './animation';
import { updateCanvasSize } from './canvas';
import { createInitialState } from './helpers';
import { AnimationRefs, AnimationState } from './types';

export const useBR = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<AnimationState | null>(null);
  const animationRef = useRef<AnimationRefs>({
    animationFrameId: 0,
    lastFrameTime: 0,
    elapsedBeforePause: 0,
    pauseTime: null,
    startTime: null,
    resizeObserver: null,
  });

  useVisibility(
    canvasRef,
    ({ isFullyVisible }, canvas) => {
      const animation = animationRef.current;

      stateRef.current ??= createInitialState();
      const state = stateRef.current;

      const getElapsed = createElapsedTimeGetter(animation);
      const handleResize = () => updateCanvasSize(canvas, state, getElapsed);

      const visibilityHandlers: Record<string, () => void> = {
        visible: () =>
          handleVisibilityOn(canvas, animation, state, handleResize),
        hidden: () => handleVisibilityOff(animation),
      };

      const visibilityState = isFullyVisible ? 'visible' : 'hidden';
      visibilityHandlers[visibilityState]();
    },
    {
      onReset: () => cleanupAnimation(animationRef.current),
    }
  );

  return { canvasRef };
};
