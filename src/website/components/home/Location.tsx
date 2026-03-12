import { useRef } from 'react';
import { translate } from '@docusaurus/Translate';
import { CalendarDays, MapPin } from 'lucide-react';
import { useScroll } from '../../hooks/useScroll';

export const Location = () => {
  const ref = useRef<HTMLDivElement>(null);

  useScroll(ref, (isVisible, target) => {
    target.className = isVisible ? 'content show' : 'content';
  });

  return (
    <main id='location'>
      <div className='content' ref={ref}>
        <h1 className='title'>
          <MapPin className='icon' />{' '}
          {translate({ id: 'location.title', message: 'Localização' })}
        </h1>
        <small className='subtitle'>
          {translate({
            id: 'location.subtitle',
            message: 'Saiba onde será a JSConf Brasil 2026.',
          })}
        </small>
        <section className='venue'>
          <div className='venue-photo'>
            <img
              className='image'
              src='/img/venue.webp'
              alt={translate({
                id: 'location.venue.imgAlt',
                message: 'USCS - Universidade Municipal de São Caetano do Sul',
              })}
            />
          </div>
          <div className='venue-info'>
            <h2 className='venue-name'>USCS</h2>
            <p className='venue-address'>
              {translate({
                id: 'location.venue.address',
                message: 'Universidade Municipal de São Caetano do Sul',
              })}
            </p>
            <div className='venue-details'>
              <span className='detail'>
                <MapPin className='detail-icon' />
                {translate({
                  id: 'location.venue.city',
                  message: 'São Caetano do Sul, SP',
                })}
              </span>
              <span className='detail'>
                <CalendarDays className='detail-icon' />
                {translate({
                  id: 'location.venue.date',
                  message: '28 de novembro de 2026',
                })}
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
