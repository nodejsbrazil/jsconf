import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

type VisibilityState = {
  isElementVisible: boolean;
  isPageVisible: boolean;
  isFullyVisible: boolean;
};

type Options<T extends Element> = {
  eject?: boolean;
  threshold?: number;
  deps?: unknown[];
  root?: Element | null;
  onReset?: (target: T) => void;
};

export const useVisibility = <T extends Element>(
  ref: RefObject<T | null>,
  cb: (state: VisibilityState, target: T) => void,
  options?: Options<T>
) => {
  const {
    threshold = 0.1,
    eject = false,
    deps = [],
    root = null,
    onReset,
  } = options ?? Object.create(null);

  const elementVisibleRef = useRef(false);
  const ejectedRef = useRef(false);

  useEffect(() => {
    const target = ref.current;
    if (!target || ejectedRef.current) return;

    onReset?.(target);

    const notify = () => {
      const isPageVisible = document.visibilityState === 'visible';
      const isElementVisible = elementVisibleRef.current;
      const isFullyVisible = isElementVisible && isPageVisible;

      cb({ isElementVisible, isPageVisible, isFullyVisible }, target);

      if (isFullyVisible && eject) {
        ejectedRef.current = true;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        elementVisibleRef.current = entry.isIntersecting;
        notify();

        if (entry.isIntersecting && eject) {
          observer.unobserve(target);
        }
      },
      { threshold, root }
    );

    const handleVisibilityChange = () => {
      notify();
    };

    observer.observe(target);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [ref, ...deps]);
};
