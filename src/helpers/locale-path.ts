export type LocaleConfigs = Record<string, { path?: string }>;

/**
 * Prefixes an in-site path with the current locale segment when needed.
 * The default locale is served at `/` with no prefix.
 * Every other locale is served at `/<localePath>/`.
 *
 * @example
 * buildLocalePath('/sponsors', 'en-US', 'pt-BR', { 'en-US': { path: 'en-US' } })
 * // → '/en-US/sponsors'
 *
 * buildLocalePath('/sponsors', 'pt-BR', 'pt-BR', {})
 * // → '/sponsors'
 */
export function buildLocalePath(
  to: string,
  currentLocale: string,
  defaultLocale: string,
  localeConfigs: LocaleConfigs
): string {
  if (currentLocale === defaultLocale) return to;
  const prefix = localeConfigs[currentLocale]?.path ?? currentLocale;
  return `/${prefix}${to}`;
}

/**
 * Returns the equivalent URL for a target locale, preserving the current
 * page path and hash.
 *
 * @example
 * buildLocaleUrl('en-US', 'pt-BR', 'pt-BR', { 'en-US': { path: 'en-US' } }, '/sponsors', '')
 * // → '/en-US/sponsors'
 *
 * buildLocaleUrl('pt-BR', 'en-US', 'pt-BR', { 'en-US': { path: 'en-US' } }, '/en-US/sponsors', '')
 * // → '/sponsors'
 */
export function buildLocaleUrl(
  targetLocale: string,
  currentLocale: string,
  defaultLocale: string,
  localeConfigs: LocaleConfigs,
  pathname: string,
  hash: string
): string {
  const isCurrentDefault = currentLocale === defaultLocale;
  const currentPrefix = isCurrentDefault
    ? ''
    : (localeConfigs[currentLocale]?.path ?? currentLocale);

  const pathWithoutLocale = currentPrefix
    ? pathname.replace(new RegExp(`^/${currentPrefix}`), '') || '/'
    : pathname;

  if (targetLocale === defaultLocale) {
    return pathWithoutLocale + hash;
  }

  const targetPrefix = localeConfigs[targetLocale]?.path ?? targetLocale;
  return `/${targetPrefix}${pathWithoutLocale}${hash}`;
}
