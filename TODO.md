# Voting system — remaining work

> Superseded the old login-only TODO: OAuth login, manager-token tier lookup, D1-backed vote
> casting, the navbar auth dropdown, and the /vote UI are all built and verified against a real
> guild.host login. What's left is deploy + a couple of known caveats. `HANDOVER.md` is deleted —
> this file plus `DEVELOPMENT.md` are now the source of truth.

## Operational notes

Two things that cost real time in August 2026, both worth reading before touching prod.

**`npm run db:init:remote` only works in CI.** `wrangler.jsonc` ships `database_id: "local"` as a
placeholder and `tools/prepare-worker.mts` swaps in the real UUID from the `WORKER_D1` secret at
build time. Without `.env` the literal string `local` reaches the API and it fails with
`Invalid property: databaseId => Invalid uuid`. From a laptop, target the database by name:

```sh
npx wrangler d1 execute jsconf --remote --file='resources/schema.sql'
```

Note the name is **`jsconf`**, not `jsconf-br`. The binding in `wrangler.jsonc` and the actual D1
database name are different, which is what makes the documented command misleading.

**The manager refresh token cannot be shared between environments.** guild rotates it on every use
and revokes the previous one, so if local and prod hold the same token, whichever refreshes first
kills the other. Give each environment its own token from a separate `?manager=1` capture. Worker
secrets are also write-only once set (`wrangler secret list` returns names only), so a lost token
means recapturing, never reading it back. The client id IS recoverable, since it travels in the
`/api/vote/login` redirect.

## Deploy checklist

Completed for the 2026 event; kept as the runbook for next time.

1. Confirm `EVENT_SLUG` in `src/server/configs/oauth.ts` matches the real event (`vdc8dh` today).
2. Apply `resources/schema.sql` to prod D1 (idempotent). See the operational note above: use
   `npx wrangler d1 execute jsconf --remote --file='resources/schema.sql'` locally, since
   `npm run db:init:remote` needs `WORKER_D1` and only works in CI.
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
6. Bootstrap `GUILD_ORG_REFRESH_TOKEN`: the capture path is gated on `env.ENVIRONMENT === 'development'`
   (fail closed — it is never reachable in prod), so run it from a development environment: local
   `wrangler dev` with `ENVIRONMENT=development`, or a throwaway dev deploy. Hit `/api/vote/login?manager=1`,
   log in with the org account, and copy the printed refresh token into the **prod** secret. The token is
   org-scoped, so where you capture it doesn't matter. After first use, D1 (`manager_oauth` table) keeps
   itself current: guild rotates the refresh token on every use, and `managerAccessToken()` writes the new
   one back automatically.
   **If you ever rotate the secret by hand,** know that D1 wins over the env var while a row exists.
   `managerAccessToken()` now retries with the bootstrap secret when the stored token is refused, so a
   rotated secret recovers on its own. Before that fallback existed this needed
   `DELETE FROM manager_oauth WHERE id = 1` to make the new value reachable at all.
7. Delete the dev-only `?manager=1` capture branch in `authLogin`/`authCallback`
   (`src/server/routes/auth.ts`) once the prod token is bootstrapped — already inert in production,
   but worth removing as cleanup.
8. Merge `voting-system` → `main`. CD (`.github/workflows/cd_deploy.yml`) builds the worker
   (`tools/prepare-worker.mts` injects the real D1 `database_id` from the `WORKER_D1` secret) and
   deploys both the worker and the static site.
9. Do one real login against prod post-deploy — confirm guild consent → callback → tier resolution
   → session → vote cast, end to end — before announcing voting is open.

## Admin vote dashboard (`/admin/votes`)

Organizer-only view: one row per votable talk with its vote count, a side panel listing who voted
(guild id, name, ticket tier, "2 of 5" against their tier budget, timestamp), vote removal, and an
audit log of every removal.

Who counts as an organizer is guild's answer, not ours. Every login now requests
`profile:read event_attendees:read`, and the callback calls `GET /events/{slug}/attendees?first=1`
with the **voter's own** access token. guild answers that endpoint only for users who can manage the
event and returns 403 for everyone else, so a 200 means organizer and the session JWT gets
`admin: true`. Nobody is listed in code or config.

Deploy notes on top of the checklist above:

1. `npm run db:init:remote` again after merging: `resources/schema.sql` gained `c4p_vote_audit`
   (idempotent, so re-running is safe).
2. Nothing new to add with `wrangler secret put`. The dashboard reuses `GUILD_ORG_REFRESH_TOKEN`
   for the attendee roster.
3. After deploy, log in once as an organizer (the dashboard link shows up on `/account` and in the
   navbar dropdown) and once as a plain ticket holder (no link, `/admin/votes` says organizers
   only, and normal voting still works). That second login is the one that proves the wider consent
   scope did not break attendee login.

If guild ever refuses to issue `event_attendees:read` to non-managers at authorize time, it answers
`error=invalid_scope`; `authCallback` catches that and retries once with `profile:read` alone, so
attendees still get in as non-admins.

## Known caveats (not blocking, but real)

- **Budget is baked into the session JWT at login time.** Changing a tier's `budget` in
  `ticket_tiers` does NOT retroactively update anyone already logged in — they need to log out and
  back in. Hit this directly during testing.
- **Multiple tickets per user isn't handled as "best tier wins."** `fetchTicketTier`
  (`src/server/helpers/oauth.ts`) returns the tier from the FIRST matching attendee node in guild's
  paginated list, not an aggregate/max. Untested in practice (no real multi-ticket account seen
  yet) — if it comes up, decide whether to prefer the highest-budget tier instead.
- **Admin status is baked into the session JWT at login,** exactly like `budget`. Removing someone's
  guild manager role does not take effect until their session expires (24h) or they log out.
- **Vote removal is a hard `DELETE`.** `c4p_vote_audit` records who removed what and when, but the
  vote row itself is gone and cannot be restored from the log.
- **The attendee roster is walked live on every drill-down,** 20 attendees per guild call (guild
  caps `first` at 20 regardless of what you ask for). Fine at the current event size; if it gets
  slow, cache the roster in D1 on a TTL. Marked with a `ponytail:` comment in
  `src/server/helpers/oauth.ts`.
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
