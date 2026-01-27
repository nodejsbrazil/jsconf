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
    locales: ['pt-BR'],
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
