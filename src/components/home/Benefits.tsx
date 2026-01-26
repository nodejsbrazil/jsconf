import type { CardProps } from '../shared/Cards';
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
    title: 'Conteúdo de Qualidade',
    description:
      'Palestras e workshops com especialistas do setor, últimas novidades e tendências em desenvolvimento',
  },
  {
    icon: <Earth />,
    title: 'Palestras Internacionais',
    description:
      'Convidados renomados mundialmente compartilhando conhecimento e experiências',
  },
  {
    icon: <Languages />,
    title: 'Tradutores',
    description:
      'Equipe dedicada para garantir que o conteúdo seja acessível a todos, independentemente do idioma do palestrante',
  },
  {
    icon: <Users />,
    title: 'Networking',
    description:
      'Conheça profissionais da área e amplie sua rede de contatos e possibilidades de colaboração',
  },
  {
    icon: <Rocket />,
    title: 'Oportunidades de Carreira',
    description:
      'Empresas parceiras em busca de talentos, com oportunidades reais de emprego e conexões diretas com recrutadores',
  },
  {
    icon: <GraduationCap />,
    title: 'Workshops Hands-on',
    description:
      'Sessões práticas onde você coloca a mão na massa, aprendendo tecnologias e ferramentas de forma interativa e aplicada',
  },
  {
    icon: <BadgeCheck />,
    title: 'Certificado de Participação',
    description:
      'Receba um certificado oficial do evento para comprovar sua participação e agregar valor ao seu currículo profissional',
  },
  {
    icon: <Sparkles />,
    title: 'Brindes e Sorteios',
    description:
      'Kits exclusivos, camisetas, adesivos e sorteios de prêmios oferecidos pelos patrocinadores e pela organização do evento',
  },
];

export const Benefits = () => (
  <main id='benefits'>
    <div className='content'>
      <h1>O que você vai encontrar?</h1>
      <Cards items={benefits} />
    </div>
  </main>
);
