# Voting system — remaining work

Code is complete, typechecked, linted, tested (`npm test` → 10 files pass). What's left is
operational + one live verification.

## Before deploy

- [ ] **Register an OAuth app on guild.host** (client id + secret). Redirect URI =
      `https://api.jsconf.com.br/api/vote/callback`.
- [ ] **Obtain the organizer refresh token** via a one-time OAuth consent with the
      `event_attendees:read` scope (the organizer account must be able to manage the event).
      This seeds `oauth_tokens`; the worker rotates it from then on.
- [ ] **Set worker secrets:** `GUILD_OAUTH_CLIENT_ID`, `GUILD_OAUTH_CLIENT_SECRET`,
      `GUILD_OAUTH_REDIRECT_URI`, `GUILD_ORG_REFRESH_TOKEN`, `SESSION_SECRET`
      (`wrangler secret put <NAME>`).
- [ ] **Set `ALLOWED_ORIGIN`** to the website origin (e.g. `https://jsconf.com.br`).
      Must NOT be `*` — credentialed cookies require an explicit origin.
- [ ] **Run `npm run db:init`** to create the new tables (`ticket_tiers`, `c4p_votes`,
      `oauth_tokens`).
- [ ] **Seed `ticket_tiers`** with tier→votes rows. Names must match guild.host tier names
      exactly, e.g. `INSERT INTO ticket_tiers (name, budget) VALUES ('Standard', 2), ('VIP', 5);`
- [ ] **Confirm `EVENT_SLUG`** in `src/server/configs/oauth.ts` (currently `vdc8dh`).
- [ ] **Adjust `VOTE_CLOSES_AT`** in `src/server/configs/vote.ts` to the real deadline.

## Live verification (needs a real login — can't be done headless)

- [ ] **userinfo id join.** `fetchUserInfo` (`src/server/helpers/oauth.ts`) reads the id as
      `sub ?? id ?? slugId ?? rowId`. Do one test login and confirm the returned id matches a
      `user.id`/`rowId`/`slugId` in `GET /events/{slug}/attendees`. If it's a different field,
      it's a one-line fix. If the id never joins, the OAuth-identity → tier mapping breaks and
      needs rethinking.

## Smoke test (local)

```
npm run db:init
# seed a tier + (for dev) a session via the X-Dev-User header
wrangler dev
curl -H 'X-Dev-User: user-1' localhost:8787/api/vote   # GET session (dev only)
```
Note: `X-Dev-User` works only when `ENVIRONMENT !== 'production'`; production requires the
real signed-cookie session from the OAuth flow.

## Nice-to-have (not blocking)

- [ ] Logout endpoint / button (clear `vote_session` cookie).
- [ ] Admin read endpoint for vote tallies (none exists yet — votes are write-only via the API).
- [ ] `charge.refunded` → revoke votes (Stripe webhook stub already receives the event).
