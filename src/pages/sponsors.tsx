import '@site/src/scss/pages/sponsors.scss';
import { ExternalLink, Handshake, Heart } from 'lucide-react';
import { Page } from '@site/src/components/shared/Page';
import { SafeLink } from '@site/src/components/shared/SafeLink';
import { link } from '@site/src/configs/definitions';

export default () => (
  <Page
    title='Patrocinadores'
    description='Apoie a JSConf Brasil 2026 e conecte sua marca à maior conferência de JavaScript do mundo'
  >
    <div className='page-content sponsors-page'>
      <header className='header'>
        <h1 className='title'>Seja um Patrocinador</h1>
        <p className='intro'>
          Apoie a JSConf Brasil 2026 e conecte sua marca à maior comunidade de
          JavaScript do país.
        </p>
      </header>

      <section className='why'>
        <h2 className='section-title'>Por que apoiar?</h2>
        <div className='grid'>
          <div className='card'>
            <Handshake className='card-icon' />
            <h3 className='card-title'>Visibilidade</h3>
            <p className='card-text'>
              Apresente sua empresa, produtos e oportunidades de emprego para
              centenas de desenvolvedores engajados.
            </p>
          </div>
          <div className='card'>
            <Heart className='card-icon' />
            <h3 className='card-title'>Comunidade</h3>
            <p className='card-text'>
              Contribua com um evento sem fins lucrativos que fortalece o
              ecossistema JavaScript e Node.js no Brasil.
            </p>
          </div>
        </div>
      </section>

      <section className='benefits'>
        <h2 className='section-title'>O que você ganha</h2>
        <ul className='benefits-list'>
          <li>Espaço de 10 minutos para apresentar sua empresa</li>
          <li>Logo e links divulgados em nossos canais oficiais</li>
          <li>Compartilhamento com toda a nossa base de contatos</li>
          <li>Networking direto com a comunidade de desenvolvedores</li>
        </ul>
      </section>

      <section className='cta-section'>
        <h2 className='cta-title'>Quer apoiar a JSConf Brasil 2026?</h2>
        <p className='cta-text'>
          Preencha o formulário e nossa equipe entrará em contato.
        </p>
        <SafeLink to={link.sponsors} className='cta-button'>
          QUERO SER PATROCINADOR <ExternalLink className='icon' />
        </SafeLink>
      </section>
    </div>
  </Page>
);
