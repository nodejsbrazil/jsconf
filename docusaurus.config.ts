import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';

const config: Config = {
  title: 'JSConf Brasil',
  favicon: 'favicon.ico',
  baseUrl: '/',
  url: 'https://jsconfbr.weslley.io/',
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
        theme: {
          customCss: ['./src/scss/themes.scss'],
        },
      } satisfies Preset.Options,
    ],
  ],
  staticDirectories: ['./src/assets'],
  plugins: ['docusaurus-plugin-sass'],
};

export default config;
