import type { FC, ReactNode } from 'react';
import { useRef } from 'react';
import { useScroll } from '../../hooks/useScroll';

export type CardProps = {
  id?: string;
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
};

type CardsProps = {
  items: CardProps[];
};

const Card: FC<CardProps> = ({ id, icon, title, description }) => {
  const ref = useRef<HTMLDivElement>(null);

  useScroll(ref, (isVisible, target) => {
    if (isVisible) target.classList.add('show');
  });

  return (
    <div className={`card`} ref={ref} id={id}>
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
    {items.map(({ id, icon, title, description }, index) => (
      <Card
        key={`card:${id ?? index}`}
        id={id}
        icon={icon}
        title={title}
        description={description}
      />
    ))}
  </section>
);
