import { assert, describe, it } from 'poku';
import { buildLocalePath, buildLocaleUrl } from '../locale-path';

const PT_BR = 'pt-BR';
const EN_US = 'en-US';
const configs = { [EN_US]: { path: 'en-US' } };

type LocalePathCase = [
  label: string,
  path: string,
  locale: string,
  expected: string,
  overrideConfigs?: Parameters<typeof buildLocalePath>[3],
];

const localePathCases: LocalePathCase[] = [
  ['default locale: /sponsors', '/sponsors', PT_BR, '/sponsors'],
  ['default locale: /#benefits', '/#benefits', PT_BR, '/#benefits'],
  ['default locale: /', '/', PT_BR, '/'],

  ['en-US: /sponsors', '/sponsors', EN_US, '/en-US/sponsors'],
  ['en-US: /#benefits', '/#benefits', EN_US, '/en-US/#benefits'],
  ['en-US: /', '/', EN_US, '/en-US/'],

  [
    'no config entry falls back to locale key',
    '/sponsors',
    'fr-FR',
    '/fr-FR/sponsors',
    {},
  ],
  [
    'config entry without path falls back to locale key',
    '/sponsors',
    EN_US,
    '/en-US/sponsors',
    { [EN_US]: {} },
  ],
];

describe('buildLocalePath', () => {
  for (const [
    label,
    path,
    locale,
    expected,
    overrideConfigs,
  ] of localePathCases) {
    it(label, () => {
      assert.strictEqual(
        buildLocalePath(path, locale, PT_BR, overrideConfigs ?? configs),
        expected
      );
    });
  }
});

type LocaleUrlCase = [
  label: string,
  target: string,
  current: string,
  pathname: string,
  hash: string,
  expected: string,
  overrideConfigs?: Parameters<typeof buildLocaleUrl>[3],
];

const localeUrlCases: LocaleUrlCase[] = [
  [
    'default→en-US: /sponsors',
    EN_US,
    PT_BR,
    '/sponsors',
    '',
    '/en-US/sponsors',
  ],
  [
    'default→en-US: preserves hash',
    EN_US,
    PT_BR,
    '/',
    '#benefits',
    '/en-US/#benefits',
  ],
  ['default→en-US: root path', EN_US, PT_BR, '/', '', '/en-US/'],
  [
    'en-US→default: strips prefix',
    PT_BR,
    EN_US,
    '/en-US/sponsors',
    '',
    '/sponsors',
  ],
  [
    'en-US→default: preserves hash when stripping',
    PT_BR,
    EN_US,
    '/en-US/',
    '#benefits',
    '/#benefits',
  ],
  [
    'en-US→default: empty path after strip becomes /',
    PT_BR,
    EN_US,
    '/en-US',
    '',
    '/',
  ],
  [
    'same locale non-default: no change',
    EN_US,
    EN_US,
    '/en-US/sponsors',
    '',
    '/en-US/sponsors',
  ],
  [
    'same locale default: no change',
    PT_BR,
    PT_BR,
    '/sponsors',
    '',
    '/sponsors',
  ],
  [
    'empty configs: uses locale key as prefix',
    'fr-FR',
    PT_BR,
    '/sponsors',
    '',
    '/fr-FR/sponsors',
    {},
  ],
];

describe('buildLocaleUrl', () => {
  for (const [
    label,
    target,
    current,
    pathname,
    hash,
    expected,
    overrideConfigs,
  ] of localeUrlCases) {
    it(label, () => {
      assert.strictEqual(
        buildLocaleUrl(
          target,
          current,
          PT_BR,
          overrideConfigs ?? configs,
          pathname,
          hash
        ),
        expected
      );
    });
  }
});
