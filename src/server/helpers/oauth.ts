import {
  AUTHORIZE_URL,
  OAUTH_SCOPE,
  TOKEN_URL,
  USERINFO_URL,
} from '../configs/oauth.js';

export const buildAuthorizeUrl = (
  clientId: string,
  redirectUri: string,
  state: string
): string => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: OAUTH_SCOPE,
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
};

export const exchangeCode = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string } | null> => {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  }).catch(() => null);

  if (!res || !res.ok) return null;
  return (await res.json()) as { access_token: string };
};

export const refreshToken = async (
  refresh: string,
  clientId: string,
  clientSecret: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
} | null> => {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  }).catch(() => null);

  if (!res || !res.ok) return null;
  return (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
};

// Returns the authenticated user's stable id.
// ponytail: VERIFY LIVE — the userinfo id field that joins the attendees list
// (user.id / rowId / slugId) is unconfirmed. We try the common keys; adjust once verified.
export const fetchUserInfo = async (
  accessToken: string
): Promise<string | null> => {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => null);

  if (!res || !res.ok) return null;
  const data = (await res.json()) as Record<string, unknown>;
  const id = data['sub'] ?? data['id'] ?? data['slugId'] ?? data['rowId'];
  return typeof id === 'string' ? id : null;
};
