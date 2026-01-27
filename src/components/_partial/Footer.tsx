import Link from '@docusaurus/Link';
import Logo from '../../assets/img/logo.svg';
import { SafeLink } from '../shared/SafeLink';

export const Footer = () => {
  return (
    <footer className='main-footer'>
      <div className='content'>
        <aside>
          <h2>
            <Logo
              className='logo'
              aria-label='Voltar para o topo'
              title='Voltar para o topo'
            />{' '}
            JSConf <span>Brasil</span>
          </h2>
          <p>
            Feito pela e para a comunidade. A JSConf Brasil é um evento sem fins
            lucrativos dedicado a impulsionar o desenvolvimento web e fortalecer
            a comunidade JavaScript no nosso país.
          </p>
        </aside>
        <aside>
          <h3>Evento</h3>
          <ul>
            <li>
              <Link to='/'>Início</Link>
            </li>
            <li>
              <Link to='/#benefits'>O que você vai encontrar?</Link>
            </li>
            <li>
              <Link to='/#speakers'>Palestrantes</Link>
            </li>
            <li>
              <Link to='/#team'>Nosso Time</Link>
            </li>
            <li>
              <Link to='/coc'>Código de Conduta</Link>
            </li>
          </ul>
        </aside>
      </div>
      <div className='footnote'>
        © 2026 JSConf Brasil. Realização{' '}
        <SafeLink to='https://nodebr.org'>NodeBR</SafeLink>.
      </div>
    </footer>
  );
};
