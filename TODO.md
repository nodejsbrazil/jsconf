# Voting system — remaining work

> Superseded the old login-only TODO: OAuth login, manager-token tier lookup, D1-backed vote
> casting, the navbar auth dropdown, and the /vote UI are all built and verified against a real
> guild.host login. What's left is deploy + a couple of known caveats. `HANDOVER.md` is deleted —
> this file plus `DEVELOPMENT.md` are now the source of truth.

## Deploy checklist

1. Confirm `EVENT_SLUG` in `src/server/configs/oauth.ts` matches the real event (`vdc8dh` today).
2. `npm run db:init:remote` — applies `resources/schema.sql` to prod D1 (idempotent).
3. Seed prod `ticket_tiers` (tier name must match guild.host exactly, case-sensitive):
   ```sql
   INSERT INTO ticket_tiers (name, budget) VALUES ('Super Early Bird', 2), ('Early Bird', 1);
   ```
   Any tier NOT listed here defaults to budget 1 (see `budgetForTier` in
   `src/server/repositories/vote.ts`) — only add rows for overrides.
4. `npm run secret` (`wrangler secret put`) for: `GUILD_OAUTH_CLIENT_ID`,
   `GUILD_OAUTH_CLIENT_SECRET`, `SESSION_SECRET`, `GUILD_ORG_REFRESH_TOKEN`.
   `ALLOWED_ORIGIN` = `https://jsconf.com.br` (never `*` — credentialed cookies need an explicit
   origin).
5. Confirm the guild.host OAuth app has `https://api.jsconf.com.br/api/vote/callback` registered
   as a redirect URI (in addition to the localhost one used for dev).
6. Bootstrap `GUILD_ORG_REFRESH_TOKEN` in prod: hit `https://api.jsconf.com.br/api/vote/login?manager=1`
   once (dev-only path, gated on `env.ENVIRONMENT !== 'production'` — confirm `ENVIRONMENT` is unset
   or `production` there, or this route 500s intentionally). Copy the printed refresh token into the
   prod secret. After first use, D1 (`manager_oauth` table) keeps itself current — guild rotates the
   refresh token on every use, and `managerAccessToken()` writes the new one back automatically.
7. Delete the dev-only `?manager=1` capture branch in `authLogin`/`authCallback`
   (`src/server/routes/auth.ts`) once the prod token is bootstrapped — already inert in production,
   but worth removing as cleanup.
8. Merge `voting-system` → `main`. CD (`.github/workflows/cd_deploy.yml`) builds the worker
   (`tools/prepare-worker.mts` injects the real D1 `database_id` from the `WORKER_D1` secret) and
   deploys both the worker and the static site.
9. Do one real login against prod post-deploy — confirm guild consent → callback → tier resolution
   → session → vote cast, end to end — before announcing voting is open.

## Known caveats (not blocking, but real)

- **Budget is baked into the session JWT at login time.** Changing a tier's `budget` in
  `ticket_tiers` does NOT retroactively update anyone already logged in — they need to log out and
  back in. Hit this directly during testing.
- **Multiple tickets per user isn't handled as "best tier wins."** `fetchTicketTier`
  (`src/server/helpers/oauth.ts`) returns the tier from the FIRST matching attendee node in guild's
  paginated list, not an aggregate/max. Untested in practice (no real multi-ticket account seen
  yet) — if it comes up, decide whether to prefer the highest-budget tier instead.
- **Rate limiter shares one bucket in local dev.** `checkRateLimit` keys on
  `CF-Connecting-IP`/`X-Forwarded-For`, absent locally, so ALL local requests (yours + any curl
  testing) share a single `'unknown'` bucket (10 req/60s). Not a prod issue — Cloudflare always
  sets `CF-Connecting-IP` there.

## Admin cheat sheet

Add a votable talk:

```sql
INSERT INTO speakers (name, email, phone, city, state, travel_pref, experience, bio)
  VALUES (...);
INSERT INTO talks (speaker_id, duration, title, description, audience_level, reason, status)
  VALUES (<speaker_id>, <0|1>, '<title>', '<description>', <0-3>, '<reason>', 2);
```

`status = 2` is what makes a talk appear on `/vote` — nothing else to touch.

Hide a talk without losing its votes: `UPDATE talks SET status = <anything but 2> WHERE id = <id>;`

Change a tier's budget: `UPDATE ticket_tiers SET budget = <n> WHERE name = '<exact tier name>';`
(remember the JWT caveat above — affected users need to re-login).

Change the voting deadline: edit `VOTE_CLOSES_AT` in `src/server/configs/vote.ts` (hardcoded,
requires a deploy — deliberate, since it changes rarely).
