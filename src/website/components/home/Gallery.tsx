import type { FC, ReactNode, RefObject } from 'react';
import { useRef } from 'react';
import { Camera, Handshake, PartyPopper, Users } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
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

const PhotoCard: FC<PhotoCardProps> = ({ src, alt, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  useBentoScroll(ref);

  return (
    <div className={`bento-item photo-card ${className}`} ref={ref}>
      <Image src={src} alt={alt} />
    </div>
  );
};

export const Gallery = () => {
  return (
    <main id='gallery'>
      <div className='content'>
        <h1 className='title'>
          <Camera className='icon' /> <Text id='gallery.title' />
        </h1>
        <div className='bento-grid'>
          {/* Row 1: text | photo (span 2) | text */}
          <TextCard
            icon={<Users />}
            title={<Text id='gallery.community.title' />}
            description={<Text id='gallery.community.description' />}
          />
          <PhotoCard
            src='/img/community/group-photo.webp'
            alt='Foto em grupo do evento presencial'
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
            alt='Plateia assistindo a palestra'
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
            alt='Grupo fazendo networking no evento'
          />
          {/* Row 3: photo | photo (span 2) | photo */}
          <PhotoCard
            src='/img/community/nodebr-selfie.webp'
            alt='NodeBR selfie group'
          />
          <PhotoCard
            src='/img/community/selfie-group.webp'
            alt='NodeBR selfie'
            className='span-2'
          />
          <PhotoCard
            src='/img/community/meetup-full.webp'
            alt='NodeBR meetup full'
          />
        </div>
      </div>
    </main>
  );
};
