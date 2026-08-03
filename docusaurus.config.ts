import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';

try {
  process.loadEnvFile?.();
} catch {}

const config: Config = {
  title: 'JSConf Brasil',
  tagline:
    'A maior conferência de JavaScript do mundo chega ao Brasil: 28 de novembro de 2026, em São Caetano do Sul, SP',
  favicon: 'favicon.ico',
  baseUrl: '/',
  // Origin only, no trailing slash: everything else (canonicals, og:image, JSON-LD @id)
  // is built by concatenating a leading-slash path onto this.
  url: 'https://jsconf.com.br',
  trailingSlash: true,
  onBrokenLinks: 'warn',
  // Stays off: the anchor checker only knows about MDX heading anchors, so on a site whose
  // sections are React components it flags every single `/#id` link — including ones that do
  // render (`#home`, `#benefits`, `#location`, `#tickets` are all in the built HTML). 54 false
  // positives per build is how people learn to stop reading build output.
  onBrokenAnchors: 'ignore',
  onDuplicateRoutes: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  // Fonts load from here rather than from a CSS `@import` in themes.scss. Inside the bundle the
  // browser had to parse the whole stylesheet before it could even resolve fonts.googleapis.com,
  // and fonts.gstatic.com only after that: three serialized round trips. Warm both up instead.
  // Keep the families and weights in sync with $baseFontFamily / $titleFontFamily.
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/img/apple-touch-icon.png',
      },
    },
    {
      tagName: 'link',
      attributes: { rel: 'manifest', href: '/manifest.webmanifest' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?display=swap&family=Noto+Sans:wght@400;500;600&family=Onest:wght@700;800',
      },
    },
  ],
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en-US', 'es-419'],
    localeConfigs: {
      'pt-BR': {
        label: '🇧🇷 Português',
        path: 'pt-BR',
      },
      'en-US': {
        label: '🇺🇸 English',
        path: 'en-US',
      },
      'es-419': {
        // 🌎 rather than 🇪🇸: es-419 is Latin American Spanish, not Spain's.
        label: '🌎 Español',
        path: 'es-419',
      },
    },
  },
  presets: [
    [
      'classic',
      {
        blog: false,
        docs: false,
        pages: {
          path: 'src/website/pages',
        },
        theme: {
          customCss: ['./src/website/scss/themes.scss'],
        },
        sitemap: {
          // Both are `noindex` shells that fill themselves in client-side; listing them in a
          // sitemap only asks crawlers to spend budget on pages we are telling them to drop.
          ignorePatterns: ['**/vote/**', '**/account/**'],
        },
      } satisfies Preset.Options,
    ],
  ],
  customFields: {
    workerDomain: process.env['WORKER_DOMAIN'],
  },
  staticDirectories: ['./src/website/assets'],
  plugins: [
    'docusaurus-plugin-sass',
    function themeRedirectPlugin() {
      return {
        name: 'theme-redirect',
        getThemePath() {
          return './src/website/theme';
        },
      };
    },
  ],
  themeConfig: {
    // ponytail: programmatic placeholder card, generated from the existing logo and brand
    // colours. Replace it with a designed 1200x630 asset when the organizers have one.
    // Docusaurus resolves this one against `url` for us.
    image: 'img/og-card.png',
    // These, however, are emitted verbatim, so nothing here may be a relative URL.
    metadata: [
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'JSConf Brasil' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      {
        property: 'og:image:alt',
        content: 'JSConf Brasil, 28 NOV 2026, São Caetano do Sul, SP',
      },
    ],
  } satisfies Preset.ThemeConfig,
};

export default config;
