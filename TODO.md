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

## BLOCKER — verify group-ticket behavior before trusting per-individual voting

Policy chosen: each guest votes individually with their own tier budget. This only works if
guild.host turns each guest into their own attendee. Unverified, and the API schema allows the
opposite (one attendee owning N ticket items).

- [ ] Run `GET https://guild.host/api/next/events/vdc8dh/attendees` (organizer token) for a
      known multi-ticket purchase:
      - N attendee edges, each a distinct `user` → guests are real attendees, our model works.
      - 1 attendee edge with `ticketOrder.eventTicketOrderItems.totalCount = N` → buyer holds
        all; guests have no identity → per-individual voting impossible without a guild setting
        that forces per-ticket claiming, or a manual admin-create fallback.
- [ ] Confirm in the guild dashboard that the event requires each guest to claim/assign their
      ticket to their own account.

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

## Simplify

- [ ] **Lean on auth libraries — but no external auth service.** Hard constraint: NO hosted
      identity service or external dashboard (no Auth0, Clerk, WorkOS, hosted Supabase-auth).
      Self-hosted libraries that run inside our worker with tokens/sessions stored in OUR D1
      are fine. We keep our data; we just stop writing the crypto.

      Right now we hand-roll the whole surface: OAuth authorize/exchange/refresh + state/CSRF
      (`helpers/oauth.ts`, `routes/auth.ts`), HMAC session sign/verify + base64url
      (`helpers/session.ts`), and cookie parse/serialize (duplicated `readCookie` in both
      files). All of it is a security boundary. Replace with a lib, owning as little as possible:

      - **Own least (preferred if it fits):** a self-hosted auth lib handling OAuth + session +
        cookies, persisting to our D1. `@auth/core` (Auth.js, D1 adapter) or `better-auth` (D1
        via Drizzle/Kysely). Both are libraries, not services — no external dashboard. Catch:
        guild.host is a **non-standard** provider (custom `userinfo`, unverified id-join field);
        confirm the lib's generic-OAuth provider can model it before committing, or it fights us.
      - **Own a bit more (safe fallback):** `arctic` generic `OAuth2Client` (authorize / code
        exchange / refresh + state/PKCE) + `jose` for the session JWT + the `cookie` package for
        parse/serialize. Lighter, no adapter, fits the custom provider more flexibly. Still all
        in-process, tokens in our D1.

      Try `@auth/core` first; drop to arctic+jose if guild's non-standard shape doesn't map.
      Either way tokens stay in our D1 and `resolveBudget` / the votes flow are unchanged.

## Nice-to-have (not blocking)

- [ ] Logout endpoint / button (clear `vote_session` cookie).
- [ ] Admin read endpoint for vote tallies (none exists yet — votes are write-only via the API).
- [ ] `charge.refunded` → revoke votes (Stripe webhook stub already receives the event).
