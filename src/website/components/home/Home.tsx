import { CalendarDays } from 'lucide-react';
import { Text } from '@site/src/website/components/shared/i18n';
import { BR } from '../shared/BR';
import { Image } from '../shared/Image';

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
        <Text id='home.description' />
      </p>
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
