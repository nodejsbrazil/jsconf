import Translate from '@docusaurus/Translate';
import { CalendarDays, Tickets } from 'lucide-react';
import { link } from '@site/src/configs/definitions';
import { BR } from '../shared/BR';
import { SafeLink } from '../shared/SafeLink';
import { Waitlist } from './Waitlist';

const TranslateStrong = (props: { id: string; children?: string }) => (
  <strong>
    <Translate id={props.id}>{props.children}</Translate>
  </strong>
);

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
        <Translate id='home.date'>28 de novembro, 2026 • São Paulo</Translate>
      </small>
      <p className='description'>
        <Translate
          id='home.description'
          values={{
            code: (
              <TranslateStrong id='home.description.code'>
                código
              </TranslateStrong>
            ),
            innovation: (
              <TranslateStrong id='home.description.innovation'>
                inovação
              </TranslateStrong>
            ),
            networking: (
              <TranslateStrong id='home.description.networking'>
                networking de alta qualidade
              </TranslateStrong>
            ),
          }}
        >
          {
            'Junte-se à comunidade de desenvolvedores em um dia repleto de {code}, {innovation} e {networking}.'
          }
        </Translate>
      </p>
      <menu>
        <section>
          <SafeLink to={link.tickets} className='btn-split cta'>
            <span className='btn-icon'>
              <Tickets />
            </span>
            <span className='btn-content'>
              <span className='text'>
                <Translate id='home.cta.tickets'>COMPRAR INGRESSOS</Translate>
              </span>
            </span>
          </SafeLink>
        </section>
        <Waitlist />
      </menu>
      <footer className='credits'>
        <span className='label'>
          <Translate id='home.credits.label'>Realização</Translate>
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
