export const goToAnchor = (id: string): void => {
  try {
    const body = document.querySelector<HTMLElement>('#__docusaurus');
    if (!body) return;

    const anchor = document.querySelector<HTMLElement>(id);
    if (!anchor) return;

    const top = body
      ? anchor.offsetTop - body.offsetTop
      : anchor.getBoundingClientRect().top + window.scrollY;

    (body || window).scrollTo({
      top,
      left: 0,
      behavior: 'smooth',
    });
  } catch {}
};
