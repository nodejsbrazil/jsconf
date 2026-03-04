import { useCallback, useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { ChevronDown, ExternalLink, Globe, Menu, X } from 'lucide-react';
import { SafeLink } from '@site/src/components/shared/SafeLink';
import { link } from '@site/src/configs/definitions';
import { useLocalePath } from '@site/src/hooks/useLocalePath';
import { useScrollSpy } from '@site/src/hooks/useScrollSpy';
import Logo from '../../assets/img/logo.svg';

type Section = {
  id: string;
  label: string;
  /** No priority: hides first, 1: hides later, 2: hides last */
  priority?: 1 | 2;
  showInDesktop?: boolean;
};

export const Navbar = () => {
  const location = useLocation();
  const { i18n } = useDocusaurusContext();
  const { currentLocale, locales, localeConfigs } = i18n;
  const navbarNode = useRef<HTMLElement>(null);
  const menuNode = useRef<HTMLDivElement>(null);
  const localeDropdownRef = useRef<HTMLDivElement>(null);
  const localeMobileRef = useRef<HTMLDivElement>(null);

  const SECTIONS: Section[] = [
    {
      id: 'home',
      label: translate({ id: 'navbar.section.home', message: 'Início' }),
      showInDesktop: false,
    },
    {
      id: 'benefits',
      label: translate({
        id: 'navbar.section.benefits',
        message: 'O que você vai encontrar?',
      }),
      priority: 1,
    },
    {
      id: 'speakers',
      label: translate({
        id: 'navbar.section.speakers',
        message: 'Palestrantes',
      }),
      priority: 2,
    },
    {
      id: 'location',
      label: translate({
        id: 'navbar.section.location',
        message: 'Localização',
      }),
      priority: 1,
    },
    {
      id: 'team',
      label: translate({ id: 'navbar.section.team', message: 'Nosso Time' }),
      priority: 2,
    },
  ];

  const activeSection = useScrollSpy(SECTIONS);

  const { localePath, getLocaleUrl } = useLocalePath();

  const otherLocales = locales.filter((l) => l !== currentLocale);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (!localeDropdownRef.current) return;
    if (!(e.target instanceof Node)) return;
    if (!localeDropdownRef.current.contains(e.target)) {
      localeDropdownRef.current.classList.remove('open');
    }

    if (!localeMobileRef.current) return;
    if (!(e.target instanceof Node)) return;
    if (!localeMobileRef.current.contains(e.target)) {
      localeMobileRef.current.classList.remove('open');
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
    localeMobileRef.current?.classList.remove('open');
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
  }, [location.hash, toTop]);

  return (
    <header ref={navbarNode} className='main-navbar'>
      <div className='content'>
        <Link className='top' to={localePath('/')}>
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
            {translate({
              id: 'navbar.section.sponsors',
              message: 'Patrocinadores',
            })}
          </Link>
        </nav>
        <div className='actions'>
          {otherLocales.length > 0 && (
            <div ref={localeDropdownRef} className='locale-dropdown'>
              <button
                type='button'
                className='locale-trigger'
                onClick={() =>
                  localeDropdownRef.current?.classList.toggle('open')
                }
                aria-label={translate({
                  id: 'navbar.locale.label',
                  message: 'Idioma',
                })}
              >
                <Globe className='icon' />
                <ChevronDown className='chevron' />
              </button>
              <div className='locale-menu'>
                {otherLocales.map((locale) => (
                  <a key={locale} href={getLocaleUrl(locale)}>
                    {(localeConfigs[locale] as { label?: string })?.label ??
                      locale}
                  </a>
                ))}
              </div>
            </div>
          )}
          <SafeLink className='tickets' to={link.tickets}>
            {translate({ id: 'navbar.tickets', message: 'INGRESSOS' })}{' '}
            <ExternalLink />
          </SafeLink>
          <button
            type='button'
            className='hamburger'
            onClick={openMenu}
            aria-label={translate({
              id: 'navbar.aria.openMenu',
              message: 'Abrir menu',
            })}
          >
            <Menu className='icon' />
          </button>
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
            aria-label={translate({
              id: 'navbar.aria.closeMenu',
              message: 'Fechar menu',
            })}
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
            {translate({
              id: 'navbar.section.sponsors',
              message: 'Patrocinadores',
            })}
          </Link>
          {otherLocales.length > 0 && (
            <div ref={localeMobileRef} className='locale-mobile'>
              <button
                type='button'
                className='locale-trigger'
                onClick={() =>
                  localeMobileRef.current?.classList.toggle('open')
                }
                aria-label={translate({
                  id: 'navbar.locale.label',
                  message: 'Idioma',
                })}
              >
                <Globe className='icon' />
                {translate({ id: 'navbar.locale.label', message: 'Idioma' })}
                <ChevronDown className='chevron' />
              </button>
              <div className='locale-links'>
                {otherLocales.map((locale) => (
                  <a key={locale} href={getLocaleUrl(locale)}>
                    {(localeConfigs[locale] as { label?: string })?.label ??
                      locale}
                  </a>
                ))}
              </div>
            </div>
          )}
        </nav>
        <SafeLink className='tickets' to={link.tickets}>
          {translate({ id: 'navbar.tickets', message: 'INGRESSOS' })}{' '}
          <ExternalLink />
        </SafeLink>
      </div>
    </header>
  );
};
