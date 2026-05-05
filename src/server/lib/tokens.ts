import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { jwtVerify, SignJWT } from 'jose';

export async function generateTokens(
  user: { id: number; email: string },
  secret: string
): Promise<{ access_token: string; refresh_token: string }> {
  const encodedSecret = new TextEncoder().encode(secret);

  const access_token = await new SignJWT({
    sub: String(user.id),
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(encodedSecret);

  const refresh_token = randomBytes(64).toString('hex');

  return { access_token, refresh_token };
}

export async function validateAccessToken(
  token: string,
  secret: string
): Promise<{ sub: string; email: string; iat: number; exp: number }> {
  const encodedSecret = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, encodedSecret);

  return {
    sub: payload['sub'] as string,
    email: payload['email'] as string,
    iat: payload['iat'] as number,
    exp: payload['exp'] as number,
  };
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function validateRefreshTokenHash(token: string, hash: string): boolean {
  const tokenHash = hashRefreshToken(token);

  try {
    return timingSafeEqual(
      Buffer.from(tokenHash, 'hex'),
      Buffer.from(hash, 'hex')
    );
  } catch {
    return false;
  }
}

export function rotateRefreshToken(_token: string): string {
  return randomBytes(64).toString('hex');
}
