import { useRef } from 'react';
import { Boxes } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
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
        <h1 className='title'>
          <Boxes className='icon' /> <Text id='team.title' />
        </h1>
        <small className='subtitle'>
          <Text id='team.subtitle' />
        </small>
        <section className='speakers'>
          <Person
            name='Erick Wendel'
            img='/img/team/erick-wendel.webp'
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
          <Person
            name='Ana Neri'
            img='/img/team/ana-neri.webp'
            bio='Ana Neri é dev sênior que atua em empresas do vale do silício atualmente na Clutch desenvolvendo o futuro das credit unios, é líder da NodeBR e criadora de conteúdo tech'
            position='Senior Software Engineer'
            company='Clutch'
            social={{
              instagram: 'ananeridev',
              youtube: '@AnaNeriDev',
              linkedin: 'anabeatrizdev',
              github: 'ananeridev',
              website: 'https://ananeri.dev/',
            }}
          />
          <Person
            name='Weslley'
            img='/img/team/wells.webp'
            bio='Wells criou o melhor test runner o poku e é o mantenedor do mySQL'
            position='Senior Software Engineer'
            company='Poku'
            social={{
              instagram: '@wellwelwel',
              youtube: '@weslleyio',
              linkedin: 'wellwelwel',
              github: 'wellwelwel',
              website: 'https://weslley.io/',
            }}
          />
          <Person
            name='Lojhan'
            img='/img/team/lojhan.webp'
            bio='He is DEV, co-founder and CEO of Meli'
            position='Senior Software Engineer'
            company='MELI'
            social={{
              instagram: 'lojhan.dev',
              linkedin: 'lojhan',
              github: 'Lojhan',
              website: 'https://www.lojhan.com',
            }}
          />
          <Person
            name='Micaele Magalhães'
            img='/img/team/mi.webp'
            bio='Micaele é UX Designer, especialista em experiência do usuário e faz as ilustrações mais lindas (e sem IA)'
            position='Senior UX Designer e Ilustradora profissional'
            company='Clutch'
            social={{
              instagram: 'https://www.instagram.com/micaele_magalhaes/',
            }}
          />
        </section>
      </div>
    </main>
  );
};
