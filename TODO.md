# Voting system — remaining work

Code is complete, typechecked, linted, tested (`npm test` → 9 files pass). What's left is
operational + blocked on guild.host shipping "Log in with Guild" (see blockers).

> **Update 2026-06-26 (guild.host owner, Taz):**
>
> - Group-ticket question **RESOLVED** — each guest claims their own Guild account/email, so
>   every ticket holder is a separate attendee. Per-individual voting works out of the box.
> - **"Log in with Guild" 3rd-party sign-in does NOT exist yet.** The OAuth docs are
>   private-API access only. Taz will build the sign-in flow, est. **Monday 2026-06-29**, shape
>   TBD. The website login is **stubbed** until then — revisit `helpers/oauth.ts` once it ships.
> - No Stripe, no syncing. Still need Guild + Stripe **admin access** (requested from the team).

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

## RESOLVED — group-ticket behavior

Each guest votes individually with their own tier budget — and this works. Taz (guild owner)
confirmed: the buyer enters each guest's email, each guest **creates their own Guild account to
claim** their ticket (and may use a different email). So every ticket holder is a separate
attendee with their own email/data. No buyer-holds-all problem; no manual fallback needed.

## BLOCKER — "Log in with Guild" doesn't exist yet

The website login flow depends on guild.host adding 3rd-party sign-in. The OAuth at
`guild.host/docs/developers/oauth` is **private API access only**, not sign-in (per Taz).

- [ ] Wait for Taz to ship "Log in with Guild" (est. Monday 2026-06-29) and document the real
      flow. Then revisit `src/server/helpers/oauth.ts` (`buildAuthorizeUrl` / `exchangeCode` /
      `fetchUserInfo`) and `routes/auth.ts` against the actual endpoints/shape.
- [ ] Until then the login is **stubbed**; everything else (votes, budget, tables, tests) works
      via the dev `X-Dev-User` header.

## BLOCKER — Guild admin access

Stripe is out — voting is guild-only. The Stripe webhook path (buyer-derived budget) was
removed; the only attendee/tier source is the guild.host attendees API.

- [ ] Get **admin access to Guild** (Guild API key + manager-flow OAuth to read all attendees).
      Requested from the JSConf team (Erick Wendel / Ana Beatriz) on 2026-06-26.
- [ ] Fallback if access never comes: collect attendee emails in the purchase form instead of
      the attendees API.

## Live verification (once login exists — can't be done headless)

- [ ] **userinfo id join.** `fetchUserInfo` (`src/server/helpers/oauth.ts`) reads the id as
      `sub ?? id ?? slugId ?? rowId`. Do one test login and confirm the returned id matches a
      `user.id`/`rowId`/`slugId` in `GET /events/{slug}/attendees`. If it's a different field,
      it's a one-line fix. If the id never joins, the OAuth-identity → tier mapping breaks and
      needs rethinking. (Blocked on the "Log in with Guild" flow above.)

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

- [x] **Session crypto → `jose`.** `helpers/session.ts` now signs/verifies an HS256 JWT via
      `jose` (`SignJWT` / `jwtVerify`) instead of the hand-rolled HMAC + base64url. Alg is pinned
      (`algorithms: ['HS256']`), exp is enforced by the lib. Cookie parsing deduped into
      `helpers/cookies.ts` (`readCookie`), shared by `session.ts` + `routes/auth.ts`.

- [ ] **OAuth flow → lib (DEFERRED to the real guild flow).** `helpers/oauth.ts`
      (`buildAuthorizeUrl` / `exchangeCode` / `refreshToken` / `fetchUserInfo`) is still
      hand-rolled and still stubbed against an unknown flow. Do NOT migrate it yet — the real
      "Log in with Guild" endpoints/shape are unconfirmed, so a swap now = double rework. When
      the real flow lands, replace this file in one pass with `arctic` (generic `OAuth2Client`:
      authorize / code exchange / refresh + state/PKCE). Hard constraint holds: self-hosted lib
      only, tokens stay in our D1, NO hosted identity service. `@auth/core` / `better-auth` were
      considered and rejected for a raw Worker + non-standard provider (framework-oriented,
      custom `userinfo`). Tokens in D1 and `resolveBudget` / votes flow stay unchanged.

## Nice-to-have (not blocking)

- [ ] Logout endpoint / button (clear `vote_session` cookie).
- [ ] Admin read endpoint for vote tallies (none exists yet — votes are write-only via the API).

## Stolen from PR #40 (done)

- [x] **`parseRequest(request, schema, maxSize)`** in `helpers/request.ts` — DRYs the
      415/413/400/422 content-type/size/JSON/schema gauntlet the `c4p` + `vote` routes repeated.
- [x] **Richer talk cards** — `listTalks` + the `/api/vote` payload now include `duration` and
      `audience_level`; the `/vote` page renders them via the existing `durationOptions` /
      `audienceLevels` label arrays.

Not taken (deliberate): single-query `has_voted` (churns the response shape + test mock for a
micro-opt), explicit 403/409/404 vote status codes (semantics change, no sign-off), dev seed
script (net-new wrangler plumbing, not a quick win).
