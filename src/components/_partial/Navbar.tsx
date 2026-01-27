import { useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { ExternalLink } from 'lucide-react';
import { SafeLink } from '@site/src/components/shared/SafeLink';
import { link } from '@site/src/configs/definitions';
import { useScrollSpy } from '@site/src/hooks/useScrollSpy';
import Logo from '../../assets/img/logo.svg';

const SECTIONS = [
  { id: 'home', label: '' },
  { id: 'benefits', label: 'O que você vai encontrar?' },
  { id: 'speakers', label: 'Palestrantes' },
  { id: 'team', label: 'Nosso Time' },
] as const;

export const Navbar = () => {
  const location = useLocation();
  const navbarNode = useRef<HTMLElement>(null);
  const anchorNode = useRef<HTMLSpanElement>(null);

  const toTop = (element: Element) => {
    element.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  useScrollSpy(anchorNode, SECTIONS);

  useEffect(() => {
    try {
      const doc = document.querySelector('#__docusaurus');
      if (!doc) return;

      if (!location.hash) {
        toTop(doc);
        return;
      }

      const anchor = document.querySelector(location.hash);
      if (!anchor) {
        toTop(doc);
        return;
      }

      const top = anchor.getBoundingClientRect().top + doc.scrollTop - 150;

      doc.scrollTo({
        top,
        left: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      console.error(error);
    }
  }, [location.key]);

  return (
    <header ref={navbarNode} className='main-navbar'>
      <div className='content'>
        <Link className='top' to='/'>
          <Logo
            className='logo'
            aria-label='Voltar para o topo'
            title='Voltar para o topo'
          />
          <div className='group'>
            <h2>
              JSConf <span>Brasil</span> <strong>2026</strong>
            </h2>
            <small>28 NOV 2026 • São Paulo</small>
          </div>
        </Link>
        <span ref={anchorNode} id='anchor' />
        <SafeLink className='tickets' to={link.tickets}>
          INGRESSOS <ExternalLink />
        </SafeLink>
      </div>
    </header>
  );
};
