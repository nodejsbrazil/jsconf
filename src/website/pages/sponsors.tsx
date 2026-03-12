import '@site/src/website/scss/pages/sponsors.scss';
import { ExternalLink, Handshake, Heart } from 'lucide-react';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { Page } from '@site/src/website/components/shared/Page';
import { SafeLink } from '@site/src/website/components/shared/SafeLink';
import { link } from '@site/src/website/configs/definitions';

export default () => (
  <Page
    title={text({ id: 'sponsors.pageTitle' })}
    description={text({ id: 'sponsors.pageDescription' })}
  >
    <div className='page-content sponsors-page'>
      <header className='header'>
        <h1 className='title'>
          <Text id='sponsors.hero.title' />
        </h1>
        <p className='intro'>
          <Text id='sponsors.hero.intro' />
        </p>
      </header>

      <section className='why'>
        <h2 className='section-title'>
          <Text id='sponsors.why.title' />
        </h2>
        <div className='grid'>
          <div className='card'>
            <Handshake className='card-icon' />
            <h3 className='card-title'>
              <Text id='sponsors.visibility.title' />
            </h3>
            <p className='card-text'>
              <Text id='sponsors.visibility.text' />
            </p>
          </div>
          <div className='card'>
            <Heart className='card-icon' />
            <h3 className='card-title'>
              <Text id='sponsors.community.title' />
            </h3>
            <p className='card-text'>
              <Text id='sponsors.community.text' />
            </p>
          </div>
        </div>
      </section>

      <section className='benefits'>
        <h2 className='section-title'>
          <Text id='sponsors.benefits.title' />
        </h2>
        <ul className='benefits-list'>
          <li>
            <Text id='sponsors.benefits.item1' />
          </li>
          <li>
            <Text id='sponsors.benefits.item2' />
          </li>
          <li>
            <Text id='sponsors.benefits.item3' />
          </li>
          <li>
            <Text id='sponsors.benefits.item4' />
          </li>
        </ul>
      </section>

      <section className='cta-section'>
        <h2 className='cta-title'>
          <Text id='sponsors.cta.title' />
        </h2>
        <p className='cta-text'>
          <Text id='sponsors.cta.text' />
        </p>
        <SafeLink to={link.sponsors} className='cta-button'>
          <Text id='sponsors.cta.button' /> <ExternalLink className='icon' />
        </SafeLink>
      </section>
    </div>
  </Page>
);
