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
import { Text } from '@site/src/website/components/shared/i18n';
import { Cards } from '../shared/Cards';

const benefits: CardProps[] = [
  {
    icon: <SquareCheckBig />,
    title: <Text id='benefits.quality.title' />,
    description: <Text id='benefits.quality.description' />,
  },
  {
    icon: <Earth />,
    title: <Text id='benefits.international.title' />,
    description: <Text id='benefits.international.description' />,
  },
  {
    icon: <Languages />,
    title: <Text id='benefits.translators.title' />,
    description: <Text id='benefits.translators.description' />,
  },
  {
    icon: <Users />,
    title: <Text id='benefits.networking.title' />,
    description: <Text id='benefits.networking.description' />,
  },
  {
    icon: <Rocket />,
    title: <Text id='benefits.career.title' />,
    description: <Text id='benefits.career.description' />,
  },
  {
    icon: <GraduationCap />,
    title: <Text id='benefits.workshops.title' />,
    description: <Text id='benefits.workshops.description' />,
  },
  {
    icon: <BadgeCheck />,
    title: <Text id='benefits.certificate.title' />,
    description: <Text id='benefits.certificate.description' />,
  },
  {
    icon: <Sparkles />,
    title: <Text id='benefits.prizes.title' />,
    description: <Text id='benefits.prizes.description' />,
  },
];

export const Benefits = () => {
  return (
    <main id='benefits'>
      <div className='content'>
        <h1 className='title'>
          <Text id='benefits.title' />
        </h1>
        <Cards items={benefits} />
      </div>
    </main>
  );
};
