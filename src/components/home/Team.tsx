import { useRef } from 'react';
import { Boxes } from 'lucide-react';
import { useScroll } from '../../hooks/useScroll';
import { Person } from '../shared/Person';

export const Team = () => {
  const ref = useRef<HTMLDivElement>(null);

  useScroll(ref, (isVisible, target) => {
    target.className = isVisible ? 'content show' : 'content';
  });

  return (
    <main id='team'>
      <div className='content' ref={ref}>
        <h1>
          <Boxes /> Nosso Time
        </h1>
        <small>
          Especialistas internacionais e talentos locais compartilhando o futuro
          da web.
        </small>
        <section className='speakers'>
          <Person
            name='Erick Wendel'
            img='/img/speakers/erick-wendel.webp'
            bio='Erick Wendel é um palestrante experiente em conferências de tecnologia, conhecido como keynote speaker, e um renomado desenvolvedor da equipe principal do Node.js.'
            position='Criador de Conteúdo e Empreendedor'
            company='EW Academy'
            social={{
              instagram: 'erickwendel_',
              youtube: '@ErickWendelAcademy',
              linkedin: 'erickwendel',
              github: 'erickwendel',
              website: 'https://ew.academy/',
            }}
          />
        </section>
      </div>
    </main>
  );
};
