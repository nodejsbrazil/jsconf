import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { assert, describe, it } from 'poku';

const ROOT = cwd();
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

const DEFAULT_LOCALE = 'pt-BR';

function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1]!).sort();
}

describe('i18n translations — key parity', () => {
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

// A translation that drops or renames an interpolation token silently renders the raw
// placeholder (or nothing) at runtime, so the tokens must match the default locale exactly.
describe('i18n translations — placeholder parity', () => {
  for (const locale of LOCALES.filter((l) => l !== DEFAULT_LOCALE)) {
    describe(locale, () => {
      for (const [key, entry] of Object.entries(translations[DEFAULT_LOCALE])) {
        const expected = placeholders(entry.message);
        if (expected.length === 0) continue;

        it(`"${key}" keeps ${expected.map((name) => `{${name}}`).join(', ')}`, () => {
          const actual = placeholders(
            translations[locale][key]?.message ?? ''
          ).join(',');
          assert.strictEqual(
            actual,
            expected.join(','),
            `Placeholder mismatch for "${key}" in i18n/${locale}/code.json`
          );
        });
      }
    });
  }
});
