import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, describe, it } from 'poku';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..');

const LOCALES = ['pt-BR', 'en-US', 'es-419'] as const;

type LocaleKey = (typeof LOCALES)[number];
type TranslationFile = Record<
  string,
  { message: string; description?: string }
>;

function loadTranslations(locale: LocaleKey): TranslationFile {
  const filePath = join(ROOT, 'i18n', locale, 'code.json');
  return JSON.parse(readFileSync(filePath, 'utf-8')) as TranslationFile;
}

const translations = Object.fromEntries(
  LOCALES.map((locale) => [locale, loadTranslations(locale)])
) as Record<LocaleKey, TranslationFile>;

const allKeys = [
  ...new Set(LOCALES.flatMap((locale) => Object.keys(translations[locale]))),
].sort();

/* This test is skipped for now as we are still scaffolding the webpage structure.
 * Once the structure is in place and we have a better idea of the translation keys we need,
 * we can enable this test to ensure all locales have the same keys. */
describe.skip('i18n translations — key parity', () => {
  for (const locale of LOCALES) {
    describe(locale, () => {
      for (const key of allKeys) {
        it(`has key "${key}"`, () => {
          assert.ok(
            key in translations[locale],
            `Missing key "${key}" in i18n/${locale}/code.json`
          );
        });
      }
    });
  }
});
