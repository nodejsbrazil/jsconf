import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';

try {
  process.loadEnvFile?.();
} catch {}

const config: Config = {
  title: 'JSConf Brasil',
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
        label: '🇪🇸 Español',
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
};

export default config;
