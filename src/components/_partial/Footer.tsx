import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
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
            <Logo
              className='logo'
              aria-label={translate({
                id: 'navbar.aria.logo',
                message: 'Voltar para o topo',
              })}
              title={translate({
                id: 'navbar.aria.logo',
                message: 'Voltar para o topo',
              })}
            />{' '}
            JSConf <span className='highlight'>Brasil</span>
          </h2>
          <p className='description'>
            {translate({
              id: 'footer.description',
              message:
                'Feito pela e para a comunidade. A JSConf Brasil é um evento sem fins lucrativos dedicado a impulsionar o desenvolvimento web e fortalecer a comunidade JavaScript no nosso país.',
            })}
          </p>
        </aside>
        <aside className='links'>
          <h3 className='title'>
            {translate({ id: 'footer.event', message: 'Evento' })}
          </h3>
          <ul>
            <li>
              <Link to={localePath('/')}>
                {translate({ id: 'navbar.section.home', message: 'Início' })}
              </Link>
            </li>
            <li>
              <Link to={localePath('/#speakers')}>
                {translate({
                  id: 'navbar.section.speakers',
                  message: 'Palestrantes',
                })}
              </Link>
            </li>
            <li>
              <Link to={localePath('/#location')}>
                {translate({
                  id: 'navbar.section.location',
                  message: 'Localização',
                })}
              </Link>
            </li>
            <li>
              <Link to={localePath('/sponsors')}>
                {translate({
                  id: 'navbar.section.sponsors',
                  message: 'Patrocinadores',
                })}
              </Link>
            </li>
            <li>
              <Link to={localePath('/brand')}>
                {translate({
                  id: 'brand.pageTitle',
                  message: 'Identidade Visual',
                })}
              </Link>
            </li>
            <li>
              <Link to={localePath('/coc')}>
                {translate({
                  id: 'coc.pageTitle',
                  message: 'Código de Conduta',
                })}
              </Link>
            </li>
          </ul>
        </aside>
      </div>
      <div className='footnote'>
        {translate({
          id: 'footer.copyright',
          message: '© 2026 JSConf Brasil. Realização',
        })}{' '}
        <SafeLink to='https://nodebr.org'>NodeBR</SafeLink>.
      </div>
    </footer>
  );
};
