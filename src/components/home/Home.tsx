import { CalendarDays, Tickets } from 'lucide-react';
import { BR } from '../shared/BR';
import { SafeLink } from '../shared/SafeLink';

export const Home = () => (
  <main id='home'>
    <div className='content'>
      <BR className='br' />
      <h1>
        JSConf{' '}
        <span>
          Bra
          <em className='odometer'>
            <span className='letter'>z</span>
            <span className='letter'>s</span>
          </em>
          il
        </span>{' '}
        2026
      </h1>
      <small>
        <CalendarDays /> 28 de novembro, 2026 • São Paulo
      </small>
      <p>
        Junte-se à comunidade de desenvolvedores em um dia repleto de{' '}
        <strong>código</strong>, <strong>inovação</strong> e{' '}
        <strong>networking de alta qualidade</strong>.
      </p>
      <menu>
        <section>
          <SafeLink to='#' className='btn-split cta'>
            <span className='btn-icon'>
              <Tickets />
            </span>
            <span className='btn-content'>
              <span className='text'>COMPRAR INGRESSOS</span>
            </span>
          </SafeLink>
        </section>
      </menu>
      <footer>
        <span>Realização</span>
        <img src='/img/logotype.png' alt='Logotipo: NodeBR' title='NodeBR' />
      </footer>
    </div>
  </main>
);
