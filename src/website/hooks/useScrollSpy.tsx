import { useEffect, useState } from 'react';

type Section = {
  id: string;
};

type Options = {
  threshold?: number | number[];
  rootMargin?: string;
};

const DEFAULT_THRESHOLD = [0.1, 0.5];
const DEFAULT_ROOT_MARGIN = '-120px 0px 0px 0px';

export const useScrollSpy = <T extends readonly Section[]>(
  sections: T,
  options?: Options
): string | null => {
  const { threshold = DEFAULT_THRESHOLD, rootMargin = DEFAULT_ROOT_MARGIN } =
    options ?? Object.create(null);

  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const visibleSections = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting)
            visibleSections.set(id, entry.intersectionRatio);
          else visibleSections.delete(id);
        }

        const current = sections.find((s) => visibleSections.has(s.id));
        setActiveId(current?.id ?? null);
      },
      { threshold, rootMargin }
    );

    for (const { id } of sections) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [sections, threshold, rootMargin]);

  return activeId;
};
