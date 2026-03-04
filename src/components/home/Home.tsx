import { translate } from '@docusaurus/Translate';
import { CalendarDays, Tickets } from 'lucide-react';
import { link } from '@site/src/configs/definitions';
import { BR } from '../shared/BR';
import { SafeLink } from '../shared/SafeLink';

export const Home = () => (
  <main id='home'>
    <div className='content'>
      <BR className='br' />
      <h1 className='title'>
        JSConf{' '}
        <span className='highlight'>
          Bra
          <em className='odometer'>
            <span className='letter'>z</span>
            <span className='letter'>s</span>
          </em>
          il
        </span>{' '}
        2026
      </h1>
      <small className='date'>
        <CalendarDays className='icon' />{' '}
        {translate({
          id: 'home.date',
          message: '28 de novembro, 2026 • São Paulo',
        })}
      </small>
      <p className='description'>
        {translate({
          id: 'home.description',
          message:
            'Junte-se à comunidade de desenvolvedores em um dia repleto de código, inovação e networking de alta qualidade.',
        })}
      </p>
      <menu>
        <section>
          <SafeLink to={link.tickets} className='btn-split cta'>
            <span className='btn-icon'>
              <Tickets />
            </span>
            <span className='btn-content'>
              <span className='text'>
                {translate({
                  id: 'home.cta.tickets',
                  message: 'COMPRAR INGRESSOS',
                })}
              </span>
            </span>
          </SafeLink>
        </section>
      </menu>
      <footer className='credits'>
        <span className='label'>
          {translate({ id: 'home.credits.label', message: 'Realização' })}
        </span>
        <img
          className='logo'
          src='/img/logotype.png'
          alt='Logotipo: NodeBR'
          title='NodeBR'
        />
      </footer>
    </div>
  </main>
);
