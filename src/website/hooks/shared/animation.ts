export const stopAnimationFrame = (refs: {
  animationFrameId: number;
}): void => {
  cancelAnimationFrame(refs.animationFrameId);
};

export const cleanupAnimation = (refs: {
  animationFrameId: number;
  resizeObserver: ResizeObserver | null;
}): void => {
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
