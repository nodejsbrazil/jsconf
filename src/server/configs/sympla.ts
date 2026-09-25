// Sympla public API (spec: https://developers.sympla.com.br/api-docs). Auth is an `s_token` header
// generated in Sympla under Minha Conta > Integrações.
export const SYMPLA_API = 'https://api.sympla.com.br/public/v1.6.0';

// JSConf Brasil event on Sympla. The API wants the event hash (`id` from `GET /events`), not the
// numeric `reference_id` 3593934 in the public URL, which answers "Event not found".
// Move to an Env var if it ever changes per environment.
export const SYMPLA_EVENT_ID = 's36d6ce';

// order_status values that count as a paid ticket. The official spec types the field as a bare
// string; a real approved order returned "APPROVED" from v1.6.0 (checked 2026-09-25). Anything else
// (pending, cancelled, refunded) is rejected.
export const SYMPLA_PAID_ORDER_STATUS = ['APPROVED'];

// Sympla sells a single tier, worth one vote. SYMPLA_TIER is the label the admin dashboard shows.
export const SYMPLA_BUDGET = 1;
export const SYMPLA_TIER = 'Sympla';

// Voter id prefix for Sympla ticket logins, so they never collide with guild.host user ids.
export const SYMPLA_USER_PREFIX = 'sympla:';
