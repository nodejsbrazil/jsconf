import { readFileSync, watch, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

const ROOT = cwd();
const SOURCE = resolve(ROOT, 'i18n', 'pt-BR', 'code.json');
const OUTPUT = resolve(ROOT, 'src', 'website', 'i18n.ts');

const generate = () => {
  const json = JSON.parse(readFileSync(SOURCE, 'utf-8')) as Record<
    string,
    unknown
  >;
  const keys = Object.keys(json);

  const union = keys.map((key) => `  | '${key}'`).join('\n');

  const content = [
    '/** generated via `npx tsx tools/generate-i18n-types.ts` */',
    '',
    'export type TranslationId =',
    union + ';',
    '',
  ].join('\n');

  writeFileSync(OUTPUT, content);
  console.log(`[i18n] Generated ${keys.length} keys → src/website/i18n.ts`);
};

generate();

if (process.argv.includes('--watch')) {
  console.log('[i18n] Watching i18n/pt-BR/code.json for changes...');
  let debounce: ReturnType<typeof setTimeout> | undefined;
  watch(SOURCE, () => {
    clearTimeout(debounce);
    debounce = setTimeout(generate, 200);
  });
}
