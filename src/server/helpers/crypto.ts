const toBase64 = (buffer: ArrayBuffer): string =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

const fromBase64 = (encoded: string): ArrayBuffer =>
  Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0)).buffer;

const importKey = (raw: string): Promise<CryptoKey> =>
  crypto.subtle.importKey('raw', fromBase64(raw), { name: 'AES-GCM' }, false, [
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

  return `${toBase64(iv.buffer)}:${toBase64(ciphertext)}`;
};

export const decrypt = async (
  stored: string,
  rawKey: string
): Promise<string> => {
  const parts = stored.split(':');
  const key = await importKey(rawKey);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(parts[0]!) },
    key,
    fromBase64(parts[1]!)
  );

  return new TextDecoder().decode(decrypted);
};
