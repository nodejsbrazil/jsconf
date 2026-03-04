import '@site/src/scss/pages/sponsors.scss';
import { translate } from '@docusaurus/Translate';
import { ExternalLink, Handshake, Heart } from 'lucide-react';
import { Page } from '@site/src/components/shared/Page';
import { SafeLink } from '@site/src/components/shared/SafeLink';
import { link } from '@site/src/configs/definitions';

export default () => (
  <Page
    title={translate({ id: 'sponsors.pageTitle', message: 'Patrocinadores' })}
    description={translate({
      id: 'sponsors.pageDescription',
      message:
        'Apoie a JSConf Brasil 2026 e conecte sua marca à maior conferência de JavaScript do mundo',
    })}
  >
    <div className='page-content sponsors-page'>
      <header className='header'>
        <h1 className='title'>
          {translate({
            id: 'sponsors.hero.title',
            message: 'Seja um Patrocinador',
          })}
        </h1>
        <p className='intro'>
          {translate({
            id: 'sponsors.hero.intro',
            message:
              'Apoie a JSConf Brasil 2026 e conecte sua marca à maior comunidade de JavaScript do país.',
          })}
        </p>
      </header>

      <section className='why'>
        <h2 className='section-title'>
          {translate({ id: 'sponsors.why.title', message: 'Por que apoiar?' })}
        </h2>
        <div className='grid'>
          <div className='card'>
            <Handshake className='card-icon' />
            <h3 className='card-title'>
              {translate({
                id: 'sponsors.visibility.title',
                message: 'Visibilidade',
              })}
            </h3>
            <p className='card-text'>
              {translate({
                id: 'sponsors.visibility.text',
                message:
                  'Apresente sua empresa, produtos e oportunidades de emprego para centenas de desenvolvedores engajados.',
              })}
            </p>
          </div>
          <div className='card'>
            <Heart className='card-icon' />
            <h3 className='card-title'>
              {translate({
                id: 'sponsors.community.title',
                message: 'Comunidade',
              })}
            </h3>
            <p className='card-text'>
              {translate({
                id: 'sponsors.community.text',
                message:
                  'Contribua com um evento sem fins lucrativos que fortalece o ecossistema JavaScript e Node.js no Brasil.',
              })}
            </p>
          </div>
        </div>
      </section>

      <section className='benefits'>
        <h2 className='section-title'>
          {translate({
            id: 'sponsors.benefits.title',
            message: 'O que você ganha',
          })}
        </h2>
        <ul className='benefits-list'>
          <li>
            {translate({
              id: 'sponsors.benefits.item1',
              message: 'Espaço de 10 minutos para apresentar sua empresa',
            })}
          </li>
          <li>
            {translate({
              id: 'sponsors.benefits.item2',
              message: 'Logo e links divulgados em nossos canais oficiais',
            })}
          </li>
          <li>
            {translate({
              id: 'sponsors.benefits.item3',
              message: 'Compartilhamento com toda a nossa base de contatos',
            })}
          </li>
          <li>
            {translate({
              id: 'sponsors.benefits.item4',
              message: 'Networking direto com a comunidade de desenvolvedores',
            })}
          </li>
        </ul>
      </section>

      <section className='cta-section'>
        <h2 className='cta-title'>
          {translate({
            id: 'sponsors.cta.title',
            message: 'Quer apoiar a JSConf Brasil 2026?',
          })}
        </h2>
        <p className='cta-text'>
          {translate({
            id: 'sponsors.cta.text',
            message: 'Preencha o formulário e nossa equipe entrará em contato.',
          })}
        </p>
        <SafeLink to={link.sponsors} className='cta-button'>
          {translate({
            id: 'sponsors.cta.button',
            message: 'QUERO SER PATROCINADOR',
          })}{' '}
          <ExternalLink className='icon' />
        </SafeLink>
      </section>
    </div>
  </Page>
);
