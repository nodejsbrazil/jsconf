import type { ComponentProps, FC } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

// width/height are the file's intrinsic pixel size and are required on purpose:
// without them the browser cannot reserve the box and every image shifts the
// layout as it lands. Pair them with `height: auto` (or `width: auto`) in CSS so
// the aspect ratio still scales.
type ImageProps = ComponentProps<'img'> & {
  width: number;
  height: number;
};

export const Image: FC<ImageProps> = ({ src, ...props }) => (
  <img src={useBaseUrl(src)} loading='lazy' decoding='async' {...props} />
);
