import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const file = '.dev.vars';
const key = 'ENCRYPTION_KEY';

if (existsSync(file)) {
  const content = readFileSync(file, 'utf-8');
  if (content.includes(`${key}=`)) {
    console.info(`${key} already exists in ${file}, skipping.`);
    process.exit(0);
  }
}

const value = randomBytes(32).toString('base64');
const existing = existsSync(file) ? readFileSync(file, 'utf-8') : '';
const separator = existing && !existing.endsWith('\n') ? '\n' : '';

writeFileSync(file, `${existing}${separator}${key}=${value}\n`);
console.info(`${key} generated and saved to ${file}`);
