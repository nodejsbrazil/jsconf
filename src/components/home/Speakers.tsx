import { useRef } from 'react';
import { translate } from '@docusaurus/Translate';
import { Clock, MicVocal } from 'lucide-react';
import { useScroll } from '../../hooks/useScroll';

export const Speakers = () => {
  const ref = useRef<HTMLDivElement>(null);

  useScroll(ref, (isVisible, target) => {
    target.className = isVisible ? 'content show' : 'content';
  });

  return (
    <main id='speakers'>
      <div className='content' ref={ref}>
        <h1 className='title'>
          <MicVocal className='icon' />{' '}
          {translate({ id: 'speakers.title', message: 'Palestrantes' })}
        </h1>
        <small className='subtitle'>
          {translate({
            id: 'speakers.subtitle',
            message:
              'Especialistas internacionais e talentos locais compartilhando o futuro da web.',
          })}
        </small>
        <section className='coming-soon'>
          <Clock className='coming-soon-icon' />
          <h2 className='coming-soon-title'>
            {translate({
              id: 'speakers.comingSoon.title',
              message: 'Em Breve',
            })}
          </h2>
          <p className='coming-soon-text'>
            {translate({
              id: 'speakers.comingSoon.text',
              message:
                'Os palestrantes serão anunciados em breve. Fique ligado!',
            })}
          </p>
        </section>
      </div>
    </main>
  );
};
