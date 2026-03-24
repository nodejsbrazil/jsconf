import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { ChevronDown, ExternalLink, Globe, Menu, X } from 'lucide-react';
import { Toaster } from 'sonner';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { useLocalePath } from '@site/src/website/hooks/useLocalePath';
import { useScrollSpy } from '@site/src/website/hooks/useScrollSpy';
import Logo from '../../assets/img/logo.svg';
import { link } from '../../configs/definitions';
import { SafeLink } from '../shared/SafeLink';

type Section = {
  id: string;
  label: ReactNode;
  /** No priority: hides first, 1: hides later, 2: hides last */
  priority?: 1 | 2;
  showInDesktop?: boolean;
};

const SECTIONS: Section[] = [
  {
    id: 'home',
    label: <Text id='navbar.section.home' />,
    showInDesktop: false,
  },
  {
    id: 'benefits',
    label: <Text id='navbar.section.benefits' />,
    priority: 1,
  },
  // {
  //   id: 'speakers',
  //   label: <Text id='navbar.section.speakers' />,
  //   priority: 2,
  // },
  {
    id: 'location',
    label: <Text id='navbar.section.location' />,
    priority: 1,
  },
  {
    id: 'team',
    label: <Text id='navbar.section.team' />,
  },
];

function setLocaleMenuOpen(
  container: HTMLDivElement,
  open: boolean,
  menuSelector: string
) {
  container.classList.toggle('open', open);
  const button = container.querySelector<HTMLButtonElement>('.locale-trigger');
  const menu = container.querySelector<HTMLElement>(menuSelector);
  if (button) button.setAttribute('aria-expanded', String(open));
  if (menu) {
    menu.setAttribute('aria-hidden', String(!open));
    menu.querySelectorAll<HTMLAnchorElement>('a').forEach((a) => {
      a.tabIndex = open ? 0 : -1;
    });
  }
}

export const Navbar = () => {
  const location = useLocation();
  const { i18n } = useDocusaurusContext();
  const { currentLocale, locales, localeConfigs } = i18n;
  const navbarNode = useRef<HTMLElement>(null);
  const menuNode = useRef<HTMLDivElement>(null);
  const localeDropdownRef = useRef<HTMLDivElement>(null);
  const localeMobileRef = useRef<HTMLDivElement>(null);

  const activeSection = useScrollSpy(SECTIONS);

  const { localePath, getLocaleUrl } = useLocalePath();

  const otherLocales = locales.filter((l) => l !== currentLocale);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (!localeDropdownRef.current) return;
    if (!(e.target instanceof Node)) return;
    if (!localeDropdownRef.current.contains(e.target)) {
      setLocaleMenuOpen(localeDropdownRef.current, false, '.locale-menu');
    }

    if (!localeMobileRef.current) return;
    if (!(e.target instanceof Node)) return;
    if (!localeMobileRef.current.contains(e.target)) {
      setLocaleMenuOpen(localeMobileRef.current, false, '.locale-links');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const openMenu = useCallback(() => {
    menuNode.current?.classList.add('open');
    document.body.classList.add('menu-open');
  }, []);

  const closeMenu = useCallback(() => {
    menuNode.current?.classList.remove('open');
    document.body.classList.remove('menu-open');
    if (localeMobileRef.current) {
      setLocaleMenuOpen(localeMobileRef.current, false, '.locale-links');
    }
  }, []);

  const toTop = useCallback((element: Element) => {
    element.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);

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

      const top = anchor.getBoundingClientRect().top + doc.scrollTop - 125;

      doc.scrollTo({
        top,
        left: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      console.error(error);
    }
  }, [location.key, toTop]);

  return (
    <header ref={navbarNode} className='main-navbar'>
      <Toaster richColors closeButton theme='light' position='top-right' />
      <div className='content'>
        <Link className='top' to={localePath('/')}>
          <Logo
            className='logo'
            aria-label={text({ id: 'navbar.aria.logo' })}
            title={text({ id: 'navbar.aria.logo' })}
          />
          <div className='group'>
            <h2 className='title'>
              JSConf <span className='highlight'>Brasil</span>{' '}
              <strong className='badge'>2026</strong>
            </h2>
            <small className='date'>
              28 NOV 2026<span className='location'> • São Paulo</span>
            </small>
          </div>
        </Link>
        <nav className='desktop'>
          {SECTIONS.filter(({ showInDesktop }) => showInDesktop !== false).map(
            ({ id, priority, label }) => (
              <Link
                key={id}
                to={localePath(`/#${id}`)}
                className={activeSection === id ? 'active' : undefined}
                data-priority={priority}
              >
                {label}
              </Link>
            )
          )}
          <Link to={localePath('/sponsors')} data-priority={1}>
            <Text id='navbar.section.sponsors' />
          </Link>
        </nav>
        <div className='actions'>
          {otherLocales.length > 0 && (
            <div ref={localeDropdownRef} className='locale-dropdown'>
              <button
                type='button'
                className='locale-trigger'
                aria-expanded='false'
                aria-controls='locale-menu-desktop'
                onClick={() => {
                  if (localeDropdownRef.current) {
                    setLocaleMenuOpen(
                      localeDropdownRef.current,
                      !localeDropdownRef.current.classList.contains('open'),
                      '.locale-menu'
                    );
                  }
                }}
                aria-label={text({ id: 'navbar.locale.label' })}
              >
                <Globe className='icon' />
                <ChevronDown className='chevron' />
              </button>
              <div
                id='locale-menu-desktop'
                className='locale-menu'
                aria-hidden='true'
              >
                {otherLocales.map((locale) => (
                  <a key={locale} href={getLocaleUrl(locale)} tabIndex={-1}>
                    {(localeConfigs[locale] as { label?: string })?.label ??
                      locale}
                  </a>
                ))}
              </div>
            </div>
          )}
          <button
            type='button'
            className='hamburger'
            onClick={openMenu}
            aria-label={text({ id: 'navbar.aria.openMenu' })}
          >
            <Menu className='icon' />
          </button>
          <SafeLink className='tickets' to={link.tickets}>
            <Text id='navbar.tickets' /> <ExternalLink />
          </SafeLink>
        </div>
      </div>
      <div ref={menuNode} className='mobile-menu'>
        <header className='header'>
          <Link className='brand' to={localePath('/')} onClick={closeMenu}>
            <Logo className='logo' />
            <div className='group'>
              <h2 className='title'>
                JSConf <span className='highlight'>Brasil</span>
              </h2>
              <small className='date'>28 NOV 2026</small>
            </div>
          </Link>
          <button
            type='button'
            className='close'
            onClick={closeMenu}
            aria-label={text({ id: 'navbar.aria.closeMenu' })}
          >
            <X className='icon' />
          </button>
        </header>
        <nav className='nav'>
          {SECTIONS.map(({ id, label }) => (
            <Link
              key={id}
              to={localePath(id === 'home' ? '/' : `/#${id}`)}
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}
          <Link to={localePath('/sponsors')} onClick={closeMenu}>
            <Text id='navbar.section.sponsors' />
          </Link>
          <SafeLink className='tickets' to={link.tickets}>
            <Text id='navbar.tickets' /> <ExternalLink />
          </SafeLink>
          {otherLocales.length > 0 && (
            <div ref={localeMobileRef} className='locale-mobile'>
              <button
                type='button'
                className='locale-trigger'
                aria-expanded='false'
                aria-controls='locale-menu-mobile'
                onClick={() => {
                  if (localeMobileRef.current) {
                    setLocaleMenuOpen(
                      localeMobileRef.current,
                      !localeMobileRef.current.classList.contains('open'),
                      '.locale-links'
                    );
                  }
                }}
                aria-label={text({ id: 'navbar.locale.label' })}
              >
                <Globe className='icon' />
                <Text id='navbar.locale.label' />
                <ChevronDown className='chevron' />
              </button>
              <div
                id='locale-menu-mobile'
                className='locale-links'
                aria-hidden='true'
              >
                {otherLocales.map((locale) => (
                  <a key={locale} href={getLocaleUrl(locale)} tabIndex={-1}>
                    {(localeConfigs[locale] as { label?: string })?.label ??
                      locale}
                  </a>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
