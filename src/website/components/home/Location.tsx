import { useRef } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { useScroll } from '../../hooks/useScroll';
import { Image } from '../shared/Image';

export const Location = () => {
  const ref = useRef<HTMLDivElement>(null);

  useScroll(ref, (isVisible, target) => {
    target.className = isVisible ? 'content show' : 'content';
  });

  return (
    <section id='location' className='landing-section'>
      <div className='content' ref={ref}>
        <h2 className='title'>
          <MapPin className='icon' /> <Text id='location.title' />
        </h2>
        <small className='subtitle'>
          <Text id='location.subtitle' />
        </small>
        <section className='venue'>
          <div className='venue-photo'>
            <Image
              className='image'
              src='/img/venue.webp'
              alt={text({ id: 'location.venue.imgAlt' })}
              width={1024}
              height={682}
            />
          </div>
          <div className='venue-info'>
            <h3 className='venue-name'>USCS</h3>
            <p className='venue-address'>
              <Text id='location.venue.address' />
            </p>
            <div className='venue-details'>
              <span className='detail'>
                <MapPin className='detail-icon' />
                <Text id='location.venue.city' />
              </span>
              <span className='detail'>
                <CalendarDays className='detail-icon' />
                <Text id='location.venue.date' />
              </span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};
