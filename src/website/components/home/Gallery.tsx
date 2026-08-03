import type { FC, ReactNode, RefObject } from 'react';
import { useRef } from 'react';
import Link from '@docusaurus/Link';
import {
  Camera,
  FileText,
  Handshake,
  Mic,
  PartyPopper,
  Users,
} from 'lucide-react';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { useLocalePath } from '../../hooks/useLocalePath';
import { useScroll } from '../../hooks/useScroll';
import { Image } from '../shared/Image';

type TextCardProps = {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  className?: string;
};

type PhotoCardProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Takes two grid columns instead of one, which also doubles its `sizes` slot. */
  wide?: boolean;
};

// Read straight off `scss/pages/_gallery.scss` + `scss/pages/root.scss` (1rem =
// 10px, `:root { font-size: 62.5% }`). The grid is 4 columns / 2rem gap, drops to
// 2 columns / 1.25rem gap at 1080px and to 1 column at 540px; the section is
// padded 8rem per side, 2rem per side under 630px, and `.content` caps at 128rem.
// Photo cards are `object-fit: cover`, so the slot width is what the browser has
// to fill.
const PHOTO_SIZES = [
  '(max-width: 540px) calc(100vw - 4rem)',
  '(max-width: 630px) calc(50vw - 2.6rem)',
  '(max-width: 1080px) calc(50vw - 8.6rem)',
  '30.5rem',
].join(', ');

// `.span-2` takes two of the four columns plus the gap between them, the whole
// grid in the 2-column band, and collapses back to one column at 540px.
const WIDE_PHOTO_SIZES = [
  '(max-width: 630px) calc(100vw - 4rem)',
  '(max-width: 1080px) calc(100vw - 16rem)',
  '63rem',
].join(', ');

const useBentoScroll = (ref: RefObject<HTMLDivElement | null>) => {
  useScroll(ref, (isVisible, target) => {
    if (isVisible) target.classList.add('show');
  });
};

const TextCard: FC<TextCardProps> = ({
  icon,
  title,
  description,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useBentoScroll(ref);

  return (
    <div className={`bento-item text-card ${className}`} ref={ref}>
      <div className='icon'>{icon}</div>
      <h3 className='text-card-title'>{title}</h3>
      <p className='text-card-description'>{description}</p>
    </div>
  );
};

const PhotoCard: FC<PhotoCardProps> = ({
  src,
  alt,
  width,
  height,
  wide = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useBentoScroll(ref);

  return (
    <div
      className={
        wide ? 'bento-item photo-card span-2' : 'bento-item photo-card'
      }
      ref={ref}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={wide ? WIDE_PHOTO_SIZES : PHOTO_SIZES}
      />
    </div>
  );
};

export const Gallery = () => {
  const { localePath } = useLocalePath();

  return (
    <section id='gallery' className='landing-section'>
      <div className='content'>
        <h2 className='title'>
          <Camera className='icon' /> <Text id='gallery.title' />
        </h2>
        <div className='bento-grid'>
          {/* Row 1: text | photo (span 2) | text */}
          <TextCard
            icon={<Users />}
            title={<Text id='gallery.community.title' />}
            description={<Text id='gallery.community.description' />}
          />
          <PhotoCard
            src='/img/community/group-photo.webp'
            alt={text({ id: 'gallery.photo.groupPhoto' })}
            width={1024}
            height={768}
            wide
          />
          <TextCard
            icon={<Handshake />}
            title={<Text id='gallery.networking.title' />}
            description={<Text id='gallery.networking.description' />}
          />
          {/* Row 2: photo | text | text | photo */}
          <PhotoCard
            src='/img/community/casual-talk.webp'
            alt={text({ id: 'gallery.photo.casualTalk' })}
            width={1024}
            height={682}
          />
          <TextCard
            icon={<PartyPopper />}
            title={<Text id='gallery.events.title' />}
            description={<Text id='gallery.events.description' />}
          />
          <TextCard
            icon={<Camera />}
            title={<Text id='gallery.firstEdition.title' />}
            description={<Text id='gallery.firstEdition.description' />}
          />
          <PhotoCard
            src='/img/community/networking.webp'
            alt={text({ id: 'gallery.photo.networking' })}
            width={1024}
            height={682}
          />
          {/* Row 3: photo | photo (span 2) | photo */}
          <PhotoCard
            src='/img/community/nodebr-selfie.webp'
            alt={text({ id: 'gallery.photo.nodebrSelfie' })}
            width={1024}
            height={682}
          />
          <PhotoCard
            src='/img/community/selfie-group.webp'
            alt={text({ id: 'gallery.photo.selfieGroup' })}
            width={1024}
            height={576}
            wide
          />
          <PhotoCard
            src='/img/community/meetup-full.webp'
            alt={text({ id: 'gallery.photo.meetupFull' })}
            width={1024}
            height={682}
          />
        </div>
        <h2 className='title'>
          <Mic className='icon' /> <Text id='gallery.c4pGuide.heading' />
        </h2>
        <div className='c4p-cta'>
          <div className='c4p-cta-content'>
            <FileText className='c4p-cta-icon' />
            <div>
              <h3 className='c4p-cta-title'>
                <Text id='gallery.c4pGuide.title' />
              </h3>
              <p className='c4p-cta-description'>
                <Text id='gallery.c4pGuide.description' />
              </p>
            </div>
            <Link to={localePath('/c4p')} className='c4p-cta-link'>
              <Text id='gallery.c4pGuide.cta' />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
