import '@site/src/scss/pages/sponsors.scss';
import Translate, { translate } from '@docusaurus/Translate';
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
          <Translate id='sponsors.hero.title'>Seja um Patrocinador</Translate>
        </h1>
        <p className='intro'>
          <Translate id='sponsors.hero.intro'>
            Apoie a JSConf Brasil 2026 e conecte sua marca à maior comunidade de
            JavaScript do país.
          </Translate>
        </p>
      </header>

      <section className='why'>
        <h2 className='section-title'>
          <Translate id='sponsors.why.title'>Por que apoiar?</Translate>
        </h2>
        <div className='grid'>
          <div className='card'>
            <Handshake className='card-icon' />
            <h3 className='card-title'>
              <Translate id='sponsors.visibility.title'>Visibilidade</Translate>
            </h3>
            <p className='card-text'>
              <Translate id='sponsors.visibility.text'>
                Apresente sua empresa, produtos e oportunidades de emprego para
                centenas de desenvolvedores engajados.
              </Translate>
            </p>
          </div>
          <div className='card'>
            <Heart className='card-icon' />
            <h3 className='card-title'>
              <Translate id='sponsors.community.title'>Comunidade</Translate>
            </h3>
            <p className='card-text'>
              <Translate id='sponsors.community.text'>
                Contribua com um evento sem fins lucrativos que fortalece o
                ecossistema JavaScript e Node.js no Brasil.
              </Translate>
            </p>
          </div>
        </div>
      </section>

      <section className='benefits'>
        <h2 className='section-title'>
          <Translate id='sponsors.benefits.title'>O que você ganha</Translate>
        </h2>
        <ul className='benefits-list'>
          <li>
            <Translate id='sponsors.benefits.item1'>
              Espaço de 10 minutos para apresentar sua empresa
            </Translate>
          </li>
          <li>
            <Translate id='sponsors.benefits.item2'>
              Logo e links divulgados em nossos canais oficiais
            </Translate>
          </li>
          <li>
            <Translate id='sponsors.benefits.item3'>
              Compartilhamento com toda a nossa base de contatos
            </Translate>
          </li>
          <li>
            <Translate id='sponsors.benefits.item4'>
              Networking direto com a comunidade de desenvolvedores
            </Translate>
          </li>
        </ul>
      </section>

      <section className='cta-section'>
        <h2 className='cta-title'>
          <Translate id='sponsors.cta.title'>
            Quer apoiar a JSConf Brasil 2026?
          </Translate>
        </h2>
        <p className='cta-text'>
          <Translate id='sponsors.cta.text'>
            Preencha o formulário e nossa equipe entrará em contato.
          </Translate>
        </p>
        <SafeLink to={link.sponsors} className='cta-button'>
          <Translate id='sponsors.cta.button'>QUERO SER PATROCINADOR</Translate>{' '}
          <ExternalLink className='icon' />
        </SafeLink>
      </section>
    </div>
  </Page>
);
