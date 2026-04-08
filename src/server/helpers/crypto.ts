const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const fromHex = (hex: string): ArrayBuffer => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2)
    bytes[index / 2] = parseInt(hex.slice(index, index + 2), 16);
  return bytes.buffer;
};

const importKey = (raw: string): Promise<CryptoKey> =>
  crypto.subtle.importKey('raw', fromHex(raw), { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);

export const encrypt = async (
  plaintext: string,
  rawKey: string
): Promise<string> => {
  const key = await importKey(rawKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  return `${toHex(iv.buffer)}:${toHex(ciphertext)}`;
};

export const decrypt = async (
  stored: string,
  rawKey: string
): Promise<string> => {
  const parts = stored.split(':');
  const key = await importKey(rawKey);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromHex(parts[0]!) },
    key,
    fromHex(parts[1]!)
  );

  return new TextDecoder().decode(decrypted);
};
