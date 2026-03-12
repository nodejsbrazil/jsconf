import { useRef } from 'react';
import { Clock, MicVocal } from 'lucide-react';
import { text } from '@site/src/website/components/shared/i18n';
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
          <MicVocal className='icon' /> {text({ id: 'speakers.title' })}
        </h1>
        <small className='subtitle'>{text({ id: 'speakers.subtitle' })}</small>
        <section className='coming-soon'>
          <Clock className='coming-soon-icon' />
          <h2 className='coming-soon-title'>
            {text({ id: 'speakers.comingSoon.title' })}
          </h2>
          <p className='coming-soon-text'>
            {text({ id: 'speakers.comingSoon.text' })}
          </p>
        </section>
      </div>
    </main>
  );
};
