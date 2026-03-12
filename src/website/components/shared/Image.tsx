import type { ComponentProps, FC } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export const Image: FC<ComponentProps<'img'>> = ({ src, ...props }) => (
  <img src={useBaseUrl(src)} loading='lazy' decoding='async' {...props} />
);
