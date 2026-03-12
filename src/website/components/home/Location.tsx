import { useRef } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { text } from '@site/src/website/components/shared/i18n';
import { useScroll } from '../../hooks/useScroll';
import { Image } from '../shared/Image';

export const Location = () => {
  const ref = useRef<HTMLDivElement>(null);

  useScroll(ref, (isVisible, target) => {
    target.className = isVisible ? 'content show' : 'content';
  });

  return (
    <main id='location'>
      <div className='content' ref={ref}>
        <h1 className='title'>
          <MapPin className='icon' /> {text({ id: 'location.title' })}
        </h1>
        <small className='subtitle'>{text({ id: 'location.subtitle' })}</small>
        <section className='venue'>
          <div className='venue-photo'>
            <Image
              className='image'
              src='/img/venue.webp'
              alt={text({ id: 'location.venue.imgAlt' })}
            />
          </div>
          <div className='venue-info'>
            <h2 className='venue-name'>USCS</h2>
            <p className='venue-address'>
              {text({ id: 'location.venue.address' })}
            </p>
            <div className='venue-details'>
              <span className='detail'>
                <MapPin className='detail-icon' />
                {text({ id: 'location.venue.city' })}
              </span>
              <span className='detail'>
                <CalendarDays className='detail-icon' />
                {text({ id: 'location.venue.date' })}
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
