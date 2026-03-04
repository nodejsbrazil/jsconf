import type { CardProps } from '../shared/Cards';
import Translate from '@docusaurus/Translate';
import {
  BadgeCheck,
  Earth,
  GraduationCap,
  Languages,
  Rocket,
  Sparkles,
  SquareCheckBig,
  Users,
} from 'lucide-react';
import { Cards } from '../shared/Cards';

const benefits: CardProps[] = [
  {
    icon: <SquareCheckBig />,
    title: (
      <Translate id='benefits.quality.title'>Conteúdo de Qualidade</Translate>
    ),
    description: (
      <Translate id='benefits.quality.description'>
        Palestras e workshops com especialistas do setor, últimas novidades e
        tendências em desenvolvimento
      </Translate>
    ),
  },
  {
    icon: <Earth />,
    title: (
      <Translate id='benefits.international.title'>
        Palestras Internacionais
      </Translate>
    ),
    description: (
      <Translate id='benefits.international.description'>
        Convidados renomados mundialmente compartilhando conhecimento e
        experiências
      </Translate>
    ),
  },
  {
    icon: <Languages />,
    title: <Translate id='benefits.translators.title'>Tradutores</Translate>,
    description: (
      <Translate id='benefits.translators.description'>
        Equipe dedicada para garantir que o conteúdo seja acessível a todos,
        independentemente do idioma do palestrante
      </Translate>
    ),
  },
  {
    icon: <Users />,
    title: <Translate id='benefits.networking.title'>Networking</Translate>,
    description: (
      <Translate id='benefits.networking.description'>
        Conheça profissionais da área e amplie sua rede de contatos e
        possibilidades de colaboração
      </Translate>
    ),
  },
  {
    icon: <Rocket />,
    title: (
      <Translate id='benefits.career.title'>
        Oportunidades de Carreira
      </Translate>
    ),
    description: (
      <Translate id='benefits.career.description'>
        Empresas parceiras em busca de talentos, com oportunidades reais de
        emprego e conexões diretas com recrutadores
      </Translate>
    ),
  },
  {
    icon: <GraduationCap />,
    title: (
      <Translate id='benefits.workshops.title'>Workshops Hands-on</Translate>
    ),
    description: (
      <Translate id='benefits.workshops.description'>
        Sessões práticas onde você coloca a mão na massa, aprendendo tecnologias
        e ferramentas de forma interativa e aplicada
      </Translate>
    ),
  },
  {
    icon: <BadgeCheck />,
    title: (
      <Translate id='benefits.certificate.title'>
        Certificado de Participação
      </Translate>
    ),
    description: (
      <Translate id='benefits.certificate.description'>
        Receba um certificado oficial do evento para comprovar sua participação
        e agregar valor ao seu currículo profissional
      </Translate>
    ),
  },
  {
    icon: <Sparkles />,
    title: <Translate id='benefits.prizes.title'>Brindes e Sorteios</Translate>,
    description: (
      <Translate id='benefits.prizes.description'>
        Kits exclusivos, camisetas, adesivos e sorteios de prêmios oferecidos
        pelos patrocinadores e pela organização do evento
      </Translate>
    ),
  },
];

export const Benefits = () => {
  return (
    <main id='benefits'>
      <div className='content'>
        <h1 className='title'>
          <Translate id='benefits.title'>O que você vai encontrar?</Translate>
        </h1>
        <Cards items={benefits} />
      </div>
    </main>
  );
};
