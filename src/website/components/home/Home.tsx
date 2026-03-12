import type { TranslationId } from '@site/src/website/i18n';
import { CalendarDays, Tickets } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
import { link } from '@site/src/website/configs/definitions';
import { BR } from '../shared/BR';
import { Image } from '../shared/Image';
import { SafeLink } from '../shared/SafeLink';

// import { Waitlist } from './Waitlist';

const TranslateStrong = (props: { id: TranslationId }) => (
  <strong>
    <Text id={props.id} />
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
        <CalendarDays className='icon' /> <Text id='home.date' />
      </small>
      <p className='description'>
        <Text
          id='home.description'
          values={{
            code: <TranslateStrong id='home.description.code' />,
            innovation: <TranslateStrong id='home.description.innovation' />,
            networking: <TranslateStrong id='home.description.networking' />,
          }}
        />
      </p>
      <menu>
        <section>
          <SafeLink to={link.tickets} className='btn-split cta'>
            <span className='btn-icon'>
              <Tickets />
            </span>
            <span className='btn-content'>
              <span className='text'>
                <Text id='home.cta.tickets' />
              </span>
            </span>
          </SafeLink>
        </section>
        {/* <Waitlist /> */}
      </menu>
      <footer className='credits'>
        <span className='label'>
          <Text id='home.credits.label' />
        </span>
        <Image
          className='logo'
          src='/img/logotype.png'
          alt='Logotipo: NodeBR'
          title='NodeBR'
        />
      </footer>
    </div>
  </main>
);
