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
            bio='Ana Neri é dev sênior que atua em empresas do Vale do Silício, atualmente na Clutch desenvolvendo o futuro das credit unions, é líder da NodeBR e criadora de conteúdo tech.'
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
            bio='Weslley Araújo é um desenvolvedor com mais de 11 anos de experiência, mantenedor do MySQL2 e criador do Poku, um test runner de alta performance que desafia a própria linguagem de programação.'
            position='Principal Developer'
            company='weslley.io'
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
            bio='Tech Lead & Full Stack Developer. Ajudando equipes a construir aplicações escaláveis com tecnologias modernas. Especializado em frontend, backend e design de arquitetura.'
            position='Tech Lead'
            company='Mercado Livre'
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
            social={{
              instagram: 'micaele_magalhaes',
            }}
          />
          <Person
            name='Cristian Silva'
            img='/img/team/cristian.webp'
            bio='Formado em Análise e Desenvolvimento de Sistemas pela Fatec Rubens Lara, sou apaixonado por tecnologia e resolver problemas. Amo aprender coisas novas todos os dias e adoro ensinar aqueles que me cercam.'
            position='Software Engineer'
            company='Luizalabs'
            social={{
              linkedin: 'cristian-silva-dev',
              github: 'Cristuker',
            }}
          />
          <Person
            name='Monica Craveiro'
            img='/img/team/monica.webp'
            bio='Carioca da gema, ex-patinadora artística, gamer, #TechMaromba, Dev Emocionada, costumava fazer cálculos por aí mas hoje em dia fico “só nos compiuter”, amante de energético e aspirante a Influencer Tech.'
            position='Software Engineer'
            company='Luizalabs'
            social={{
              linkedin: 'mocraveirodev',
              instagram: 'mocraveirodev',
              github: 'mocraveirodev',
              website: 'https://5tr.in/mocraveirodev/',
            }}
          />
        </section>
      </div>
    </main>
  );
};
