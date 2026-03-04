import { useRef } from 'react';
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
          <MicVocal className='icon' /> Palestrantes
        </h1>
        <small className='subtitle'>
          Especialistas internacionais e talentos locais compartilhando o futuro
          da web.
        </small>
        <section className='coming-soon'>
          <Clock className='coming-soon-icon' />
          <h2 className='coming-soon-title'>Em Breve</h2>
          <p className='coming-soon-text'>
            Os palestrantes serão anunciados em breve. Fique ligado!
          </p>
        </section>
      </div>
    </main>
  );
};
