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
      </div>
      <div className='footnote'>
        © 2026 JSConf Brasil. Realização{' '}
        <SafeLink to='https://nodebr.org'>NodeBR</SafeLink>.
      </div>
    </footer>
  );
};
