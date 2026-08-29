// guild.host OAuth endpoints (docs: https://guild.host/docs/developers/oauth)
export const AUTHORIZE_URL = 'https://guild.host/oauth/authorize';
export const TOKEN_URL = 'https://guild.host/api/oauth/token';
export const USERINFO_URL = 'https://guild.host/api/oauth/userinfo';
export const EVENTS_BASE = 'https://guild.host/api/next/events';

// Identity only. Used as the fallback when guild rejects the wider scope below with
// error=invalid_scope, so an ordinary attendee can still log in.
// Space-separated per OAuth 2.0; URLSearchParams encodes ' ' as '+'.
export const PROFILE_SCOPE = 'profile:read';

// Every login asks for the attendee-list read too. guild only lets that endpoint answer for users
// who can manage the event (403 otherwise), so calling it once with the voter's OWN token is the
// admin check for the dashboard. No hardcoded organizer list anywhere.
export const OAUTH_SCOPE = 'profile:read event_attendees:read';

// Manager scope, used once to mint GUILD_ORG_REFRESH_TOKEN. Same set as OAUTH_SCOPE today, kept
// separate because the capture path's needs are its own.
export const MANAGER_SCOPE = 'profile:read event_attendees:read';

// Event slug hardcoded (same one the ticket widget uses, TicketSelection.tsx).
// Move to an Env var if it ever changes per environment.
export const EVENT_SLUG = 'vdc8dh';

export const SESSION_COOKIE = 'vote_session';
export const STATE_COOKIE = 'vote_oauth_state';
export const SESSION_TTL_SECONDS = 86400;
