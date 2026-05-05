import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, beforeEach, describe, it } from 'poku';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensPath = join(__dirname, '../../../src/server/lib/tokens.js');

let importCount = 0;
const importTokens = () => import(`${tokensPath}?${++importCount}`);

describe('tokens', async () => {
  const TEST_SECRET = 'test-secret-32-chars-minimum-here';

  beforeEach(async () => {
    // Dynamic import with query parameter resets module cache between tests
  });

  await it('generateTokens returns access and refresh tokens', async () => {
    const { generateTokens } = await importTokens();
    const result = await generateTokens(
      { id: 1, email: 'test@example.com' },
      TEST_SECRET
    );

    assert.ok(typeof result.access_token === 'string');
    assert.ok(result.access_token.length > 0);
    assert.ok(typeof result.refresh_token === 'string');
    assert.ok(result.refresh_token.length > 0);
    assert.notEqual(result.access_token, result.refresh_token);
  });

  await it('access token payload contains sub and email', async () => {
    const { generateTokens, validateAccessToken } = await importTokens();
    const { access_token } = await generateTokens(
      { id: 1, email: 'test@example.com' },
      TEST_SECRET
    );
    const payload = await validateAccessToken(access_token, TEST_SECRET);

    assert.equal(payload.sub, '1');
    assert.equal(payload.email, 'test@example.com');
    assert.ok(payload.exp > payload.iat);
  });

  await it('validateAccessToken rejects tampered token', async () => {
    const { generateTokens, validateAccessToken } = await importTokens();
    const { access_token } = await generateTokens(
      { id: 1, email: 'test@example.com' },
      TEST_SECRET
    );

    // Tamper with the token by changing one character in the signature portion
    const tampered = access_token.slice(0, -5) + 'XXXXX';

    let threw = false;
    try {
      await validateAccessToken(tampered, TEST_SECRET);
    } catch {
      threw = true;
    }

    assert.ok(threw);
  });

  await it('access token expires after 15 minutes', async () => {
    const { generateTokens, validateAccessToken } = await importTokens();
    const { access_token } = await generateTokens(
      { id: 1, email: 'test@example.com' },
      TEST_SECRET
    );
    const payload = await validateAccessToken(access_token, TEST_SECRET);

    assert.equal(payload.exp - payload.iat, 15 * 60);
  });

  await it('validateRefreshTokenHash returns true for correct hash', async () => {
    const { generateTokens, validateRefreshTokenHash } = await importTokens();
    const { refresh_token } = await generateTokens(
      { id: 1, email: 'test@example.com' },
      TEST_SECRET
    );

    const hash = createHash('sha256').update(refresh_token).digest('hex');

    assert.equal(validateRefreshTokenHash(refresh_token, hash), true);
  });

  await it('validateRefreshTokenHash returns false for wrong hash', async () => {
    const { validateRefreshTokenHash } = await importTokens();
    const wrongHash = createHash('sha256').update('wrong-token').digest('hex');

    assert.equal(validateRefreshTokenHash('some-token', wrongHash), false);
  });

  await it('rotateRefreshToken returns new refresh token different from old', async () => {
    const { generateTokens, rotateRefreshToken } = await importTokens();
    const { refresh_token } = await generateTokens(
      { id: 1, email: 'test@example.com' },
      TEST_SECRET
    );
    const newToken = rotateRefreshToken(refresh_token);

    assert.notEqual(newToken, refresh_token);
    assert.ok(typeof newToken === 'string');
    assert.ok(newToken.length > 0);
  });
});
