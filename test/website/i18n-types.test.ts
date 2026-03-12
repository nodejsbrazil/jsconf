import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { assert, describe, it } from 'poku';

const ROOT = cwd();
const SOURCE = resolve(ROOT, 'i18n', 'pt-BR', 'code.json');
const OUTPUT = resolve(ROOT, 'src', 'website', 'i18n.ts');

const sourceEntries = JSON.parse(readFileSync(SOURCE, 'utf-8')) as Record<
  string,
  { message: string }
>;
const sourceKeys = Object.keys(sourceEntries);

const generatedContent = readFileSync(OUTPUT, 'utf-8');

describe('generate-i18n-types — output integrity', () => {
  it('contains the auto-generated header', () => {
    assert.ok(
      generatedContent.includes(
        '/** generated via `npx tsx tools/generate-i18n-types.ts` */'
      ),
      'Missing auto-generated header comment'
    );
  });

  it('exports the TranslationId type', () => {
    assert.ok(
      generatedContent.includes('export type TranslationId ='),
      'Missing "export type TranslationId" declaration'
    );
  });

  for (const key of sourceKeys) {
    it(`includes key "${key}" in the union`, () => {
      assert.ok(
        generatedContent.includes(`| '${key}'`),
        `Missing key "${key}" in generated type union`
      );
    });
  }

  it('has no extra keys beyond the source', () => {
    const generatedKeys = [...generatedContent.matchAll(/\| '([^']+)'/g)].map(
      (match) => match[1] as string
    );

    for (const key of generatedKeys) {
      assert.ok(
        sourceKeys.includes(key),
        `Generated type contains extra key "${key}" not present in source`
      );
    }
  });

  it('has the exact same number of keys', () => {
    const generatedKeys = [...generatedContent.matchAll(/\| '([^']+)'/g)];

    assert.strictEqual(
      generatedKeys.length,
      sourceKeys.length,
      `Expected ${sourceKeys.length} keys but found ${generatedKeys.length}`
    );
  });
});

describe('generate-i18n-types — defaultMessages', () => {
  it('exports defaultMessages', () => {
    assert.ok(
      generatedContent.includes('export const defaultMessages'),
      'Missing "export const defaultMessages" declaration'
    );
  });

  for (const [key, { message }] of Object.entries(sourceEntries)) {
    it(`defaultMessages contains correct value for "${key}"`, () => {
      const escaped = message.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      assert.ok(
        generatedContent.includes(`'${key}': '${escaped}'`),
        `Missing or incorrect defaultMessages entry for "${key}"`
      );
    });
  }
});
