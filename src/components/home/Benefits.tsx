import type { CardProps } from '../shared/Cards';
import { translate } from '@docusaurus/Translate';
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

export const Benefits = () => {
  const benefits: CardProps[] = [
    {
      icon: <SquareCheckBig />,
      title: translate({
        id: 'benefits.quality.title',
        message: 'Conteúdo de Qualidade',
      }),
      description: translate({
        id: 'benefits.quality.description',
        message:
          'Palestras e workshops com especialistas do setor, últimas novidades e tendências em desenvolvimento',
      }),
    },
    {
      icon: <Earth />,
      title: translate({
        id: 'benefits.international.title',
        message: 'Palestras Internacionais',
      }),
      description: translate({
        id: 'benefits.international.description',
        message:
          'Convidados renomados mundialmente compartilhando conhecimento e experiências',
      }),
    },
    {
      icon: <Languages />,
      title: translate({
        id: 'benefits.translators.title',
        message: 'Tradutores',
      }),
      description: translate({
        id: 'benefits.translators.description',
        message:
          'Equipe dedicada para garantir que o conteúdo seja acessível a todos, independentemente do idioma do palestrante',
      }),
    },
    {
      icon: <Users />,
      title: translate({
        id: 'benefits.networking.title',
        message: 'Networking',
      }),
      description: translate({
        id: 'benefits.networking.description',
        message:
          'Conheça profissionais da área e amplie sua rede de contatos e possibilidades de colaboração',
      }),
    },
    {
      icon: <Rocket />,
      title: translate({
        id: 'benefits.career.title',
        message: 'Oportunidades de Carreira',
      }),
      description: translate({
        id: 'benefits.career.description',
        message:
          'Empresas parceiras em busca de talentos, com oportunidades reais de emprego e conexões diretas com recrutadores',
      }),
    },
    {
      icon: <GraduationCap />,
      title: translate({
        id: 'benefits.workshops.title',
        message: 'Workshops Hands-on',
      }),
      description: translate({
        id: 'benefits.workshops.description',
        message:
          'Sessões práticas onde você coloca a mão na massa, aprendendo tecnologias e ferramentas de forma interativa e aplicada',
      }),
    },
    {
      icon: <BadgeCheck />,
      title: translate({
        id: 'benefits.certificate.title',
        message: 'Certificado de Participação',
      }),
      description: translate({
        id: 'benefits.certificate.description',
        message:
          'Receba um certificado oficial do evento para comprovar sua participação e agregar valor ao seu currículo profissional',
      }),
    },
    {
      icon: <Sparkles />,
      title: translate({
        id: 'benefits.prizes.title',
        message: 'Brindes e Sorteios',
      }),
      description: translate({
        id: 'benefits.prizes.description',
        message:
          'Kits exclusivos, camisetas, adesivos e sorteios de prêmios oferecidos pelos patrocinadores e pela organização do evento',
      }),
    },
  ];

  return (
    <main id='benefits'>
      <div className='content'>
        <h1 className='title'>
          {translate({
            id: 'benefits.title',
            message: 'O que você vai encontrar?',
          })}
        </h1>
        <Cards items={benefits} />
      </div>
    </main>
  );
};
