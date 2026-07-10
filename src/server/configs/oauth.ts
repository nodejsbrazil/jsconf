// guild.host OAuth endpoints (docs: https://guild.host/docs/developers/oauth)
export const AUTHORIZE_URL = 'https://guild.host/oauth/authorize';
export const TOKEN_URL = 'https://guild.host/api/oauth/token';
export const USERINFO_URL = 'https://guild.host/api/oauth/userinfo';
export const EVENTS_BASE = 'https://guild.host/api/next/events';

// Voters only need identity — the tier is read server-side with the manager token, so a normal
// login requests just profile:read. Space-separated per OAuth 2.0; URLSearchParams encodes ' ' as '+'.
export const OAUTH_SCOPE = 'profile:read';

// Manager scope, used once to mint GUILD_ORG_REFRESH_TOKEN. Adds attendee-list read (only granted
// for events the account manages).
export const MANAGER_SCOPE = 'profile:read event_attendees:read';

// ponytail: event slug hardcoded (same one the ticket widget uses, TicketSelection.tsx).
// Move to an Env var if it ever changes per environment.
export const EVENT_SLUG = 'vdc8dh';

export const SESSION_COOKIE = 'vote_session';
export const STATE_COOKIE = 'vote_oauth_state';
export const SESSION_TTL_SECONDS = 86400;
