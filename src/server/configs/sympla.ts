// Sympla public API (spec: https://developers.sympla.com.br/api-docs). Auth is an `s_token` header
// generated in Sympla under Minha Conta > Integrações.
export const SYMPLA_API = 'https://api.sympla.com.br/public/v1.6.0';

// JSConf Brasil event on Sympla. Move to an Env var if it ever changes per environment.
export const SYMPLA_EVENT_ID = '3593934';

// order_status values that count as a paid ticket: A = aprovado. P (pending), NA (not approved),
// NP (not paid), R (refund requested) and C (cancelled) are rejected. The official spec types the
// field as a bare string; these values come from Kondado's Sympla connector docs.
export const SYMPLA_PAID_ORDER_STATUS = ['A'];

// Sympla sells a single tier, worth one vote. SYMPLA_TIER is the label the admin dashboard shows.
export const SYMPLA_BUDGET = 1;
export const SYMPLA_TIER = 'Sympla';

// Voter id prefix for Sympla ticket logins, so they never collide with guild.host user ids.
export const SYMPLA_USER_PREFIX = 'sympla:';
