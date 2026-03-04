import { useEffect, useState } from 'react';

type Section = {
  id: string;
};

type Options = {
  threshold?: number | number[];
  rootMargin?: string;
};

export const useScrollSpy = <T extends readonly Section[]>(
  sections: T,
  options?: Options
): string | null => {
  const { threshold = [0.1, 0.5], rootMargin = '-120px 0px 0px 0px' } =
    options ?? Object.create(null);

  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibleSections = new Map<string, number>();

    for (const { id } of sections) {
      const element = document.getElementById(id);
      if (!element) continue;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;

          if (entry.isIntersecting)
            visibleSections.set(id, entry.intersectionRatio);
          else visibleSections.delete(id);

          const current = sections.find((s) => visibleSections.has(s.id));
          setActiveId(current?.id ?? null);
        },
        { threshold, rootMargin }
      );

      observer.observe(element);
      observers.push(observer);
    }

    return () => {
      for (const obs of observers) obs.disconnect();
    };
  }, [sections, threshold, rootMargin]);

  return activeId;
};
