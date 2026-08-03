import type { ComponentProps, FC } from 'react';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import { candidates } from '../../configs/images';

// width/height are the file's intrinsic pixel size and are required on purpose:
// without them the browser cannot reserve the box and every image shifts the
// layout as it lands. Pair them with `height: auto` (or `width: auto`) in CSS so
// the aspect ratio still scales.
//
// sizes is required for the same reason, from the other direction: the wrapper
// hands the browser a whole ladder of widths, and with no `sizes` the browser
// assumes the image fills the viewport and reaches for the largest candidate —
// worse than shipping no `srcset` at all. It has to describe the slot the image
// actually occupies at each breakpoint, so it belongs to the layout, i.e. to the
// call site, not here.
type ImageProps = ComponentProps<'img'> & {
  src: string;
  width: number;
  height: number;
  sizes: string;
};

export const Image: FC<ImageProps> = ({ src, width, ...props }) => {
  const { withBaseUrl } = useBaseUrlUtils();
  const srcSet = candidates(src, width)
    .map((candidate) => `${withBaseUrl(candidate.path)} ${candidate.width}w`)
    .join(', ');

  return (
    <img
      src={withBaseUrl(src)}
      srcSet={srcSet}
      width={width}
      loading='lazy'
      decoding='async'
      {...props}
    />
  );
};
