import type { FC, ReactNode } from 'react';
import { useRef } from 'react';
import { useScroll } from '../../hooks/useScroll';

export type CardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

type CardsProps = {
  items: CardProps[];
};

const Card: FC<CardProps> = ({ icon, title, description }) => {
  const ref = useRef<HTMLDivElement>(null);

  useScroll(ref, (isVisible, target) => {
    if (isVisible) target.classList.add('show');
  });

  return (
    <div className={`card`} ref={ref}>
      <div className='containter'>
        <header className='icon'>{icon}</header>
        <h3 className='title'>{title}</h3>
        <p className='description'>{description}</p>
      </div>
    </div>
  );
};

export const Cards: FC<CardsProps> = ({ items }) => (
  <section className='cards'>
    {items.map(({ icon, title, description }) => (
      <Card key={title} icon={icon} title={title} description={description} />
    ))}
  </section>
);
