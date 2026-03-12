import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';

try {
  process.loadEnvFile?.();
} catch {}

const config: Config = {
  title: 'JSConf Brasil',
  favicon: 'favicon.ico',
  baseUrl: '/',
  url: 'https://jsconf.nodebr.org/',
  trailingSlash: true,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'ignore',
  onDuplicateRoutes: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en-US', 'es-419'],
    localeConfigs: {
      'en-US': {
        label: 'English',
        path: 'en-US',
      },
      'es-419': {
        label: 'Español',
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
