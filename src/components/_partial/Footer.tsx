import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import { useLocalePath } from '@site/src/hooks/useLocalePath';
import Logo from '../../assets/img/logo.svg';
import { SafeLink } from '../shared/SafeLink';

export const Footer = () => {
  const { localePath } = useLocalePath();

  return (
    <footer className='main-footer'>
      <div className='content'>
        <aside className='about'>
          <h2 className='title'>
            <Logo className='logo' aria-hidden /> JSConf{' '}
            <span className='highlight'>Brasil</span>
          </h2>
          <p className='description'>
            <Translate id='footer.description'>
              Feito pela e para a comunidade. A JSConf Brasil é um evento sem
              fins lucrativos dedicado a impulsionar o desenvolvimento web e
              fortalecer a comunidade JavaScript no nosso país.
            </Translate>
          </p>
        </aside>
        <aside className='links'>
          <h3 className='title'>
            <Translate id='footer.event'>Evento</Translate>
          </h3>
          <ul>
            <li>
              <Link to={localePath('/')}>
                <Translate id='navbar.section.home'>Início</Translate>
              </Link>
            </li>
            <li>
              <Link to={localePath('/#speakers')}>
                <Translate id='navbar.section.speakers'>Palestrantes</Translate>
              </Link>
            </li>
            <li>
              <Link to={localePath('/#location')}>
                <Translate id='navbar.section.location'>Localização</Translate>
              </Link>
            </li>
            <li>
              <Link to={localePath('/sponsors')}>
                <Translate id='navbar.section.sponsors'>
                  Patrocinadores
                </Translate>
              </Link>
            </li>
            <li>
              <Link to={localePath('/brand')}>
                <Translate id='brand.pageTitle'>Identidade Visual</Translate>
              </Link>
            </li>
            <li>
              <Link to={localePath('/coc')}>
                <Translate id='coc.pageTitle'>Código de Conduta</Translate>
              </Link>
            </li>
          </ul>
        </aside>
      </div>
      <div className='footnote'>
        <Translate id='footer.copyright'>
          © 2026 JSConf Brasil. Realização
        </Translate>{' '}
        <SafeLink to='https://nodebr.org'>NodeBR</SafeLink>.
      </div>
    </footer>
  );
};
