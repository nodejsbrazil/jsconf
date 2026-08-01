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
  className?: string;
};

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
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useBentoScroll(ref);

  return (
    <div className={`bento-item photo-card ${className}`} ref={ref}>
      <Image src={src} alt={alt} width={width} height={height} />
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
            className='span-2'
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
            className='span-2'
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
