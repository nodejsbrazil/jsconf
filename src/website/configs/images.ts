/**
 * Naming and width rules shared by the `Image` wrapper and the generator in
 * `tools/generate-image-variants.mts`. Both sides have to agree on every URL or
 * the browser picks a candidate that does not exist, so the rules live here once
 * instead of being spelled out twice.
 */

/**
 * The width ladder. Deliberately short: the widest source on the site is 1024px,
 * so the file's own width closes the ladder and nothing is ever upscaled. 200
 * covers the wordmark and the partner rail, 400 covers a phone at 1x, 800 covers
 * the same phone at 2x and the two-column desktop band.
 */
const ladder = [200, 400, 800];

/** `/img/logotype.png` at 200 wide → `/img/logotype-200w.webp`. */
const variantPath = (src: string, width: number) =>
  `${src.replace(/\.[^./]+$/, '')}-${width}w.webp`;

/**
 * Whether a path is one of the files `variantPath` produces. The generator writes
 * variants next to their sources, so it needs this to avoid picking up its own
 * output on the next run and generating variants of variants.
 */
export const isVariant = (path: string) => /-\d+w\.webp$/.test(path);

/**
 * WebP sources are already the format we want and re-encoding a lossy WebP only
 * loses quality, so those reuse the original file as the full-size candidate.
 * PNG/JPEG sources get a WebP twin at full size instead, which is what stops the
 * heavier original from ever being the candidate a browser settles on.
 */
const reusesOriginalAtFullSize = (src: string) => src.endsWith('.webp');

export type ImageCandidate = { path: string; width: number };

/**
 * Every candidate for a source of `intrinsicWidth` pixels: the ladder steps that
 * are genuinely smaller than the file, then the file's own width.
 */
export const candidates = (
  src: string,
  intrinsicWidth: number
): ImageCandidate[] => {
  const widths = [
    ...ladder.filter((width) => width < intrinsicWidth),
    intrinsicWidth,
  ];

  return widths.map((width) => {
    if (width === intrinsicWidth && reusesOriginalAtFullSize(src))
      return { path: src, width };
    return { path: variantPath(src, width), width };
  });
};
