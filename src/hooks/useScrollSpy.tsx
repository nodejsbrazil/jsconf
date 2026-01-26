import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

type Section = {
  id: string;
  label: string;
};

type Options = {
  threshold?: number | number[];
  rootMargin?: string;
};

export const useScrollSpy = <T extends readonly Section[]>(
  ref: RefObject<HTMLElement | null>,
  sections: T,
  options?: Options
): void => {
  const { threshold = [0.1, 0.5], rootMargin = '-120px 0px 0px 0px' } =
    options ?? Object.create(null);

  const currentLabel = useRef(sections[0]?.label ?? '');

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const observers: IntersectionObserver[] = [];
    const visibleSections = new Map<string, number>();

    for (const { id } of sections) {
      const element = document.getElementById(id);
      if (!element) continue;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting)
            visibleSections.set(id, entry.intersectionRatio);
          else visibleSections.delete(id);

          const current = sections.find((s) => visibleSections.has(s.id));
          if (current && current.label !== currentLabel.current) {
            currentLabel.current = current.label;

            target.style.animation = 'none';
            target.offsetHeight;
            target.style.animation = '';
            target.textContent = current.label;

            target.setAttribute('data-anchor', current.label);
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(element);
      observers.push(observer);
    }

    return () => {
      for (const obs of observers) obs.disconnect();
    };
  }, [ref, sections, threshold, rootMargin]);
};
