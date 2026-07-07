# Voting system — remaining work

Code is complete, typechecked, linted, tested (`npm test` → 9 files pass). What's left is
operational + the `/ticket` refactor below.

## ✅ DONE (code) — switched budget to the per-user `/ticket` endpoint (2026-07-07)

Refactor below is **code-complete**: `npm run typecheck` / `lint` / `test` (9 files) pass. All
checklist boxes done. Still needs the **live-login verification runbook** (undocumented shapes)
and the operational deploy steps. NEXT ACTUAL STEP: run the live-login runbook once, confirm the
four shapes, adjust `fetchTicketTier` / `fetchUserInfo` if needed.

Decision made with the user 2026-07-07, checking `guild.host/docs/developers/oauth`. This
**reverses** the locked org-token decision: the docs DO expose a per-user endpoint
`GET https://guild.host/api/next/events/{slug}/ticket` (scope `event_tickets:read`) returning
the authenticated user's OWN ticket. Our OAuth app already requests that scope. So we read the
voter's tier from THEIR token at login instead of fetching the whole attendee list with an
organizer token.

Why: kills the org-token machinery, removes the userinfo→attendees id-join blocker, and unblocks
local testing (no organizer consent needed).

**New flow:** callback → `exchangeCode` → access_token → `fetchUserInfo` (user id) +
`fetchTicketTier` (tier via `/ticket`) → join `ticket_tiers` for budget → bake `{ sub, budget }`
into the session JWT. `voteGet`/`voteSubmit` read budget from the signed session — no per-request
guild call, no stored attendee token.

Checklist:

- [x] `helpers/oauth.ts`: added `fetchTicketTier(accessToken, slug)` hitting
      `${EVENTS_BASE}/{slug}/ticket`. **Response shape UNDOCUMENTED** — first guess reuses the tier
      path (`ticketOrder.eventTicketOrderItems.nodes[0].eventTicketingTier.name`); confirm on first
      live login. Deleted `refreshToken`.
- [x] `helpers/session.ts`: session carries budget. `signSession(userId, budget, secret, ttl)`;
      `verifySession` → `Session | null`; `getUserId` → `getSession` → `Session`. Dev `X-Dev-User`
      path returns `DEV_BUDGET = 3` so local testing works without a login.
- [x] `routes/auth.ts`: `authCallback` takes `database` (wired in `index.ts`). Resolves tier→budget
      via `vote(database).budgetForTier`; no ticket → `?error=notattendee`, no session.
- [x] `routes/vote.ts`: reads `{ userId, budget }` from `getSession`; dropped `resolveBudget` + the
      `budget === null` 403 (non-attendees never get a session).
- [x] DELETED `repositories/oauth-token.ts`, `repositories/attendees.ts`, the `oauth_tokens` table,
      and `GUILD_ORG_REFRESH_TOKEN` (types.ts, .env.example, .dev.vars.example). Kept `lru.min` —
      the rate limiter still uses it.
- [x] `configs/oauth.ts`: renamed `ATTENDEES_BASE` → `EVENTS_BASE`. Also dropped the now-unused
      `event_attendees:read` scope (only `profile:read event_tickets:read` requested now).
- [x] Rewrote `test/server/routes/vote.test.ts`: removed oauth-token + attendees mocks; session
      tests carry budget; added `budgetForTier` tests; voteGet/voteSubmit budget from the session
      (dev path). Dropped the non-attendee 403 test (no longer reachable).

### Endpoints CONFIRMED from the docs (2026-07-07)

- authorize `https://guild.host/oauth/authorize` ✓ (matches code)
- token `https://guild.host/api/oauth/token` ✓
- userinfo `https://guild.host/api/oauth/userinfo` ✓ — but **response fields are NOT documented**
- per-user ticket `https://guild.host/api/next/events/{slug}/ticket` (`event_tickets:read`)
- attendees `https://guild.host/api/next/events/{slug}/attendees?first=20` (`event_attendees:read`,
  only when the Guild user can manage the event) — no longer used after the refactor
- scopes: `profile:read`, `event_tickets:read`, `event_attendees:read` ✓ (all requested)
- tokens: access 1d, refresh 30d rotating, auth code 10min single-use

### Still needs ONE live login to confirm (undocumented shapes)

1. **userinfo id field** — which of `sub`/`id`/`slugId`/`rowId` is the stable id. Keys `c4p_votes`.
2. **`/ticket` response shape** — where the tier name sits. Adjust `fetchTicketTier` once seen.
3. **"no ticket" shape** — what `/ticket` returns for a non-attendee (404? empty body? null
   field?). Needed to branch `?error=notattendee` correctly.
4. **token response** — confirm `exchangeCode` gets `access_token` (+ whether `expires_in` /
   `refresh_token` come back). Log the KEYS only, never the token value.

### Live-login verification runbook (do this ONCE, then apply + delete the temp code)

Goal: capture the four shapes above from a single real login. `/ticket` need not be wired yet —
the temp probe calls it directly with the fresh access token.

1. **Have a test Guild account that holds a ticket on event `vdc8dh`.** Also note a second
   account with NO ticket if you can, for step 8.
2. **Seed a tier row** so the budget join has something to hit. Use the exact guild tier name if
   you know it; otherwise seed a couple and correct after step 6:
   `npm run db:init` then
   `wrangler d1 execute jsconf-br --command "INSERT OR IGNORE INTO ticket_tiers (name, budget) VALUES ('Standard', 3), ('VIP', 5)"`
3. **Add temp logging** in `routes/auth.ts` `authCallback`, right after the `if (!tokens)` guard
   (import `USERINFO_URL`, `EVENT_SLUG`, `EVENTS_BASE`):
   ```ts
   // TEMP DEBUG — remove after verifying (do NOT log the raw token value)
   console.log('TOKEN keys', Object.keys(tokens));
   const at = tokens.access_token;
   const ui = await fetch(USERINFO_URL, {
     headers: { Authorization: `Bearer ${at}` },
   });
   console.log('USERINFO', ui.status, await ui.text());
   const tk = await fetch(`${EVENTS_BASE}/${EVENT_SLUG}/ticket`, {
     headers: { Authorization: `Bearer ${at}` },
   });
   console.log('TICKET', tk.status, await tk.text());
   ```
4. **Run** `npm start` (website :3000 + `wrangler dev` :8787). Keep the `wrangler dev` terminal
   visible — `console.log` prints there.
5. **Log in** at `http://localhost:8787/api/vote/login`, consent on guild, land back on `/vote`.
6. **Read the terminal:**
   - `USERINFO` line → pick the stable id key → set it in `fetchUserInfo`
     (`src/server/helpers/oauth.ts`), replacing the `sub ?? id ?? slugId ?? rowId` guess.
   - `TICKET` line → find the tier NAME path → that's what `fetchTicketTier` returns. Confirm the
     name string equals a `ticket_tiers.name` you seeded (fix the seed in step 2 if it differs).
   - `TOKEN keys` → confirm `access_token` present; note if `expires_in`/`refresh_token` exist.
7. **Confirm the join:** the tier name from `/ticket` must match `ticket_tiers.name` exactly
   (case-sensitive). If guild returns e.g. `"Ingresso Padrão"`, seed that literal string.
8. **(If you have a no-ticket account) log in with it** → record the `TICKET` status/body for the
   non-attendee branch (`?error=notattendee`).
9. **Delete the temp logging.** Then wire `fetchTicketTier` + `fetchUserInfo` with the confirmed
   shapes and finish the refactor checklist above.

Security: the temp probe logs userinfo + ticket bodies (your own account PII) to the local
terminal only — fine for local dev, but don't paste raw output anywhere shared, and never log the
access token value.

### Local creds (already set)

`.dev.vars` (gitignored) holds the real client id/secret, redirect URI, a random SESSION_SECRET,
`ALLOWED_ORIGIN=http://localhost:3000`, `ENVIRONMENT=development`. **Rotate the client secret on
guild.host before go-live** — it was pasted in plaintext chat. `.dev.vars.example` is the template.

Run: `npm start` (website :3000 + `wrangler dev` :8787). Login at
`http://localhost:8787/api/vote/login`.

---

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
      `https://api.jsconf.com.br/api/vote/callback`. Scopes: `profile:read event_tickets:read`.
- [ ] **Set worker secrets:** `GUILD_OAUTH_CLIENT_ID`, `GUILD_OAUTH_CLIENT_SECRET`,
      `GUILD_OAUTH_REDIRECT_URI`, `SESSION_SECRET` (`wrangler secret put <NAME>`).
- [ ] **Set `ALLOWED_ORIGIN`** to the website origin (e.g. `https://jsconf.com.br`).
      Must NOT be `*` — credentialed cookies require an explicit origin.
- [ ] **Run `npm run db:init`** to create the tables (`ticket_tiers`, `c4p_votes`).
- [ ] **Seed `ticket_tiers`** with tier→votes rows. Names must match guild.host tier names
      exactly, e.g. `INSERT INTO ticket_tiers (name, budget) VALUES ('Standard', 2), ('VIP', 5);`
- [ ] **Confirm `EVENT_SLUG`** in `src/server/configs/oauth.ts` (currently `vdc8dh`).
- [ ] **Adjust `VOTE_CLOSES_AT`** in `src/server/configs/vote.ts` to the real deadline.

## RESOLVED — group-ticket behavior

Each guest votes individually with their own tier budget — and this works. Taz (guild owner)
confirmed: the buyer enters each guest's email, each guest **creates their own Guild account to
claim** their ticket (and may use a different email). So every ticket holder is a separate
attendee with their own email/data. No buyer-holds-all problem; no manual fallback needed.

## ~~BLOCKER — "Log in with Guild" doesn't exist yet~~ — RESOLVED 2026-07-07

Login now exists. OAuth app registered, real client id/secret + endpoints in hand (see RESUME
HERE). Endpoints confirmed against the docs. Historical note below.

The website login flow depends on guild.host adding 3rd-party sign-in. The OAuth at
`guild.host/docs/developers/oauth` is **private API access only**, not sign-in (per Taz).

- [ ] Wait for Taz to ship "Log in with Guild" (est. Monday 2026-06-29) and document the real
      flow. Then revisit `src/server/helpers/oauth.ts` (`buildAuthorizeUrl` / `exchangeCode` /
      `fetchUserInfo`) and `routes/auth.ts` against the actual endpoints/shape.
- [ ] Until then the login is **stubbed**; everything else (votes, budget, tables, tests) works
      via the dev `X-Dev-User` header.

## ~~BLOCKER — Guild admin access~~ — SUPERSEDED by the `/ticket` refactor (2026-07-07)

The org-token / manage-event access was only needed to read the full attendee list. The
per-user `/ticket` endpoint removes that need — each voter's own `event_tickets:read` token
returns their tier. No organizer admin access required. (Historical note kept below.)

- [ ] ~~Get admin access to Guild (API key + manager-flow OAuth to read all attendees).~~
- [ ] Fallback if `/ticket` doesn't pan out: collect attendee emails in the purchase form.

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

- [x] Logout endpoint (`GET /api/vote/logout`, clears `vote_session`, redirects to `/vote`) +
      "Sair" button on the `/vote` page.
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
