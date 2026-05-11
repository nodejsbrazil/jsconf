export const goToAnchor = (id: string): void => {
  try {
    const body = document.querySelector<HTMLElement>('#__docusaurus');
    if (!body) return;

    const anchor = document.querySelector<HTMLElement>(id);
    if (!anchor) return;

    const top = anchor.offsetTop - body.offsetTop;

    (body || window).scrollTo({
      top,
      left: 0,
      behavior: 'smooth',
    });
  } catch (error) {
    console.error(error);
  }
};
