// guild.host OAuth endpoints (docs: https://guild.host/docs/developers/oauth)
export const AUTHORIZE_URL = 'https://guild.host/oauth/authorize';
export const TOKEN_URL = 'https://guild.host/api/oauth/token';
export const USERINFO_URL = 'https://guild.host/api/oauth/userinfo';
export const EVENTS_BASE = 'https://guild.host/api/next/events';

// Scopes requested at authorize time: identity (userinfo) + the voter's own ticket.
// Space-separated per OAuth 2.0; URLSearchParams encodes the space as '+'.
export const OAUTH_SCOPE = 'profile:read event_tickets:read';

// ponytail: event slug hardcoded (same one the ticket widget uses, TicketSelection.tsx).
// Move to an Env var if it ever changes per environment.
export const EVENT_SLUG = 'vdc8dh';

export const SESSION_COOKIE = 'vote_session';
export const STATE_COOKIE = 'vote_oauth_state';
export const SESSION_TTL_SECONDS = 86400;
