import { execSync } from 'node:child_process';

const { ENCRYPTION_KEY } = process.env;
if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not set');

const fromBase64 = (encoded: string): ArrayBuffer =>
  Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0)).buffer;

const decrypt = async (stored: string, rawKey: string): Promise<string> => {
  const parts = stored.split(':');
  const key = await crypto.subtle.importKey(
    'raw',
    fromBase64(rawKey),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(parts[0]!) },
    key,
    fromBase64(parts[1]!)
  );
  return new TextDecoder().decode(decrypted);
};

const remote = process.argv.includes('--remote');

const query = (sql: string): unknown[] => {
  const flag = remote ? ' --remote' : '';
  const output = execSync(
    `npx wrangler d1 execute jsconf-br --command "${sql}" --json${flag}`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  );
  const parsed = JSON.parse(output) as { results: unknown[] }[];
  return parsed[0]?.results ?? [];
};

type SpeakerRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
};

const run = async () => {
  const encryptionKey = ENCRYPTION_KEY;
  const speakers = query(
    'SELECT id, name, email, phone, city, state FROM speakers'
  ) as SpeakerRow[];

  if (speakers.length === 0) {
    console.info('No speakers found.');
    return;
  }

  for (const speaker of speakers) {
    const email = await decrypt(speaker.email, encryptionKey);
    const phone = await decrypt(speaker.phone, encryptionKey);

    console.info(`--- Speaker #${speaker.id} ---`);
    console.info(`Name:  ${speaker.name}`);
    console.info(`Email: ${email}`);
    console.info(`Phone: ${phone}`);
    console.info(`City:  ${speaker.city}, ${speaker.state}`);
    console.info('');
  }
};

run();
