import { assert, describe, it } from 'poku';
import { buildLocalePath, buildLocaleUrl } from '../locale-path';

const PT_BR = 'pt-BR';
const EN_US = 'en-US';
const configs = { [EN_US]: { path: 'en-US' } };

describe('buildLocalePath', () => {
  it('returns the path unchanged for the default locale', () => {
    assert.strictEqual(
      buildLocalePath('/sponsors', PT_BR, PT_BR, configs),
      '/sponsors'
    );
    assert.strictEqual(
      buildLocalePath('/#benefits', PT_BR, PT_BR, configs),
      '/#benefits'
    );
    assert.strictEqual(buildLocalePath('/', PT_BR, PT_BR, configs), '/');
  });

  it('prefixes the path with the locale config path', () => {
    assert.strictEqual(
      buildLocalePath('/sponsors', EN_US, PT_BR, configs),
      '/en-US/sponsors'
    );
    assert.strictEqual(
      buildLocalePath('/#benefits', EN_US, PT_BR, configs),
      '/en-US/#benefits'
    );
    assert.strictEqual(buildLocalePath('/', EN_US, PT_BR, configs), '/en-US/');
  });

  it('falls back to the locale key when localeConfigs has no path entry', () => {
    assert.strictEqual(
      buildLocalePath('/sponsors', 'fr-FR', PT_BR, {}),
      '/fr-FR/sponsors'
    );
  });

  it('falls back to the locale key when the locale has no path property', () => {
    assert.strictEqual(
      buildLocalePath('/sponsors', EN_US, PT_BR, { [EN_US]: {} }),
      '/en-US/sponsors'
    );
  });
});

describe('buildLocaleUrl', () => {
  describe('from default locale to non-default', () => {
    it('prepends the target locale prefix', () => {
      assert.strictEqual(
        buildLocaleUrl(EN_US, PT_BR, PT_BR, configs, '/sponsors', ''),
        '/en-US/sponsors'
      );
    });

    it('preserves the hash', () => {
      assert.strictEqual(
        buildLocaleUrl(EN_US, PT_BR, PT_BR, configs, '/', '#benefits'),
        '/en-US/#benefits'
      );
    });

    it('handles root path', () => {
      assert.strictEqual(
        buildLocaleUrl(EN_US, PT_BR, PT_BR, configs, '/', ''),
        '/en-US/'
      );
    });
  });

  describe('from non-default locale to default', () => {
    it('strips the current locale prefix', () => {
      assert.strictEqual(
        buildLocaleUrl(PT_BR, EN_US, PT_BR, configs, '/en-US/sponsors', ''),
        '/sponsors'
      );
    });

    it('preserves the hash when stripping prefix', () => {
      assert.strictEqual(
        buildLocaleUrl(PT_BR, EN_US, PT_BR, configs, '/en-US/', '#benefits'),
        '/#benefits'
      );
    });

    it('returns / when stripping leaves an empty path', () => {
      assert.strictEqual(
        buildLocaleUrl(PT_BR, EN_US, PT_BR, configs, '/en-US', ''),
        '/'
      );
    });
  });

  describe('same locale as target', () => {
    it('returns the same URL for non-default locale', () => {
      assert.strictEqual(
        buildLocaleUrl(EN_US, EN_US, PT_BR, configs, '/en-US/sponsors', ''),
        '/en-US/sponsors'
      );
    });

    it('returns the same URL for default locale', () => {
      assert.strictEqual(
        buildLocaleUrl(PT_BR, PT_BR, PT_BR, configs, '/sponsors', ''),
        '/sponsors'
      );
    });
  });

  describe('fallback when localeConfigs is empty', () => {
    it('uses the locale key as the prefix for non-default target', () => {
      assert.strictEqual(
        buildLocaleUrl('fr-FR', PT_BR, PT_BR, {}, '/sponsors', ''),
        '/fr-FR/sponsors'
      );
    });
  });
});
