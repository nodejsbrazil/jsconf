import type { LocaleConfigs } from '../helpers/locale-path';
import { useCallback } from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { buildLocalePath, buildLocaleUrl } from '../helpers/locale-path';

type UseLocalePath = {
  /**
   * Prefixes an in-site path with the current locale segment when needed.
   * The default locale (pt-BR) is served at `/` with no prefix.
   * Every other locale is served at `/<localePath>/`.
   *
   * @example
   * localePath('/sponsors') // → '/en-US/sponsors' (on en-US)
   * localePath('/#benefits') // → '/en-US/#benefits' (on en-US)
   * localePath('/sponsors') // → '/sponsors' (on pt-BR default)
   */
  localePath: (to: string) => string;

  /**
   * Returns the equivalent URL for a target locale, preserving the current
   * page path and hash.
   */
  getLocaleUrl: (targetLocale: string) => string;
};

export const useLocalePath = (): UseLocalePath => {
  const { i18n } = useDocusaurusContext();
  const { currentLocale, localeConfigs } = i18n;
  const location = useLocation();

  const localePath = useCallback(
    (to: string): string =>
      buildLocalePath(
        to,
        currentLocale,
        i18n.defaultLocale,
        localeConfigs as LocaleConfigs
      ),
    [currentLocale, localeConfigs, i18n.defaultLocale]
  );

  const getLocaleUrl = useCallback(
    (targetLocale: string): string =>
      buildLocaleUrl(
        targetLocale,
        currentLocale,
        i18n.defaultLocale,
        localeConfigs as LocaleConfigs,
        location.pathname,
        location.hash
      ),
    [currentLocale, localeConfigs, i18n.defaultLocale, location]
  );

  return { localePath, getLocaleUrl };
};
