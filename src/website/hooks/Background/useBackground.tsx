import type {
  AnimationRefs,
  AnimationState,
  Pointer,
  UseBackgroundOptions,
} from '@site/src/website/hooks/Background/types';
import { useCallback, useEffect, useRef } from 'react';
import { startAnimation } from '@site/src/website/hooks/Background/animation';
import {
  calculateStarCount,
  DEFAULT_CONFIG,
} from '@site/src/website/hooks/Background/definitions';
import {
  createStars,
  placeAllStars,
} from '@site/src/website/hooks/Background/stars';
import { cleanupAnimation } from '@site/src/website/hooks/shared/animation';

const createInitialState = (options: UseBackgroundOptions): AnimationState => {
  const config = { ...DEFAULT_CONFIG, ...options };

  return {
    stars: [],
    velocity: { x: 0, y: 0, targetX: 0, targetY: 0, zoom: config.zoomSpeed },
    pointer: { x: null, y: null, isTouch: false },
    dimensions: { width: 0, height: 0, scale: 1 },
    config,
  };
};

const updatePointerVelocity = (
  state: AnimationState,
  clientX: number,
  clientY: number
): void => {
  const { pointer, velocity, dimensions, config } = state;
  const { intensity } = config;

  if (pointer.x !== null && pointer.y !== null) {
    const deltaX = clientX - pointer.x;
    const deltaY = clientY - pointer.y;

    velocity.targetX += deltaX * intensity * dimensions.scale;
    velocity.targetY += deltaY * intensity * dimensions.scale;
  }

  pointer.x = clientX;
  pointer.y = clientY;
};

const resetPointer = (pointer: Pointer): void => {
  pointer.x = null;
  pointer.y = null;
};

export const useBackground = (
  options: UseBackgroundOptions = Object.create(null)
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<AnimationState>(createInitialState(options));
  const refsRef = useRef<AnimationRefs>({
    animationFrameId: 0,
    resizeObserver: null,
  });

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = stateRef.current;
    const scale = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth * scale;
    const height = canvas.offsetHeight * scale;

    canvas.width = width;
    canvas.height = height;

    state.dimensions = { width, height, scale };

    if (state.stars.length === 0) {
      const count = state.config.starCount || calculateStarCount(width, height);
      state.stars = createStars(count, state.config.starMinScale);
    }

    placeAllStars(state.stars, width, height);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const state = stateRef.current;
    state.pointer.isTouch = false;
    updatePointerVelocity(state, event.clientX, event.clientY);
  }, []);

  const handlePointerLeave = useCallback(() => {
    resetPointer(stateRef.current.pointer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = stateRef.current;
    const refs = refsRef.current;

    handleResize();

    refs.resizeObserver = new ResizeObserver(handleResize);
    refs.resizeObserver.observe(canvas);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handlePointerLeave);

    startAnimation(canvas, state, refs);

    return () => {
      cleanupAnimation(refs);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [handleResize, handleMouseMove, handlePointerLeave]);

  return { canvasRef };
};
