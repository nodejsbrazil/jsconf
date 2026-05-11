type CleanupRefs = {
  animationFrameId: number;
  resizeObserver: ResizeObserver | null;
};

export const stopAnimationFrame = (refs: {
  animationFrameId: number;
}): void => {
  cancelAnimationFrame(refs.animationFrameId);
};

export const cleanupAnimation = (refs: CleanupRefs): void => {
  stopAnimationFrame(refs);
  refs.resizeObserver?.disconnect();
  refs.resizeObserver = null;
};

export const initializeResizeObserver = (
  element: HTMLElement,
  refs: { resizeObserver: ResizeObserver | null },
  handleResize: () => void
): void => {
  if (refs.resizeObserver) return;
  refs.resizeObserver = new ResizeObserver(handleResize);
  refs.resizeObserver.observe(element);
};
