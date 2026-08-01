import Link from '@docusaurus/Link';
import { CalendarDays, Tickets } from 'lucide-react';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { useLocalePath } from '../../hooks/useLocalePath';
import { BR } from '../shared/BR';
import { Image } from '../shared/Image';

export const Home = () => {
  const { localePath } = useLocalePath();

  return (
    <section id='home'>
      <div className='content'>
        <BR className='br' />
        {/*
          The odometer keeps both letters in the DOM, so the visible markup reads
          "Brazsil". Everything animated is hidden from the accessibility tree and
          the canonical wordmark is carried by the visually hidden span instead.
          The pieces stay separate elements so they remain three flex items of
          .title, exactly like the bare text nodes they replaced.
        */}
        <h1 className='title'>
          <span className='sr-only'>JSConf Brasil 2026</span>
          <span aria-hidden='true'>JSConf</span>
          <span className='highlight' aria-hidden='true'>
            Bra
            <em className='odometer'>
              <span className='letter'>z</span>
              <span className='letter'>s</span>
            </em>
            il
          </span>
          <span aria-hidden='true'>2026</span>
        </h1>
        <small className='date'>
          <CalendarDays className='icon' /> <Text id='home.date' />
        </small>
        <p className='description'>
          <Text id='home.description' />
        </p>
        <menu>
          <section>
            <Link className='btn-split cta' to={localePath('/#tickets')}>
              <span className='btn-icon'>
                <Tickets />
              </span>
              <span className='btn-content'>
                <span className='text'>
                  <Text id='home.cta.tickets' />
                </span>
              </span>
            </Link>
          </section>
        </menu>
        <footer className='credits'>
          <span className='label'>
            <Text id='home.credits.label' />
          </span>
          <Image
            className='logo'
            src='/img/logotype.png'
            alt={text({ id: 'home.credits.logoAlt' })}
            title='NodeBR'
          />
        </footer>
      </div>
    </section>
  );
};
