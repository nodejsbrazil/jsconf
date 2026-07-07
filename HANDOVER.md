# Handover — JSConf BR attendee voting system

Context for a fresh Claude session picking up this work. Branch: `voting-system`.

> **Status update 2026-06-26 (from the guild.host owner, Taz):**
>
> - Group-ticket question **RESOLVED** — each guest claims their own Guild account/email, so
>   every ticket holder is a separate attendee. Per-individual voting works out of the box.
> - **"Log in with Guild" 3rd-party sign-in does NOT exist yet.** The guild OAuth docs are
>   private-API access only. Taz will add the sign-in flow, est. **Monday 2026-06-29**, shape
>   TBD. Our OAuth code in `helpers/oauth.ts` / `routes/auth.ts` assumes a standard flow and is
>   **stubbed/on hold** until he ships and documents the real one. Everything else works via the
>   dev `X-Dev-User` header.
> - No Stripe, no syncing. Still need Guild + Stripe **admin access** (requested from the team).

## What this is

JSConf BR landing page. Static Docusaurus site on GitHub Pages (`jsconf.com.br`), a Cloudflare
Worker API (`api.jsconf.com.br`), Cloudflare D1 (SQLite) database. Tickets sell through
guild.host (Stripe behind it). CD: push to `main` → `.github/workflows/cd_deploy.yml` builds
both, deploys worker via wrangler + site to the `website` branch.

The feature added on this branch: **ticket holders vote on C4P talks.** Each attendee votes
individually; vote allowance depends on ticket tier.

## Decisions made (with the user) and why

- **Identity = per-attendee guild.host OAuth login**, NOT tokenized email links. Reason: the
  guild.host attendees API exposes no email field, so magic-link-by-email may be impossible.
  OAuth removes the email pipeline and that feasibility risk, and gives one-account-one-voter
  integrity.
- **Budget resolved on the fly, NO cron** (user vetoed crons). At vote time the worker fetches
  the attendee list with an organizer token, caches `userId→tier` in memory (`lru.min`, 5-min
  TTL), and joins a `ticket_tiers(name, budget)` table for the vote count. There is no per-user
  attendee endpoint in the guild API, so the full list is fetched + cached.
- **Stripe removed — voting is guild-only.** Stripe knows only the buyer, and votes are per
  individual attendee. The Stripe webhook route + client + `STRIPE_*` secrets were deleted; the
  sole attendee/tier source is the guild.host attendees API.
- **Voting runs for months**, so the organizer token (24h access / 30d rotating refresh) is
  auto-refreshed and persisted in D1 — see `oauth_tokens` + `getOrgAccessToken`.
- **Vote model:** approval voting — pick up to `budget` distinct talks, toggle on/off until
  `VOTE_CLOSES_AT`. Votable talks = `talks.status = 2` (`VOTABLE_TALK_STATUS`, adopted from PR #40).
- **Session:** signed JWT cookie (`vote_session`) via `jose` (HS256, alg-pinned), `SameSite=None;
Secure` so it survives the cross-subdomain fetch from the website to the API. No DB session
  store. (Was hand-rolled HMAC; swapped to `jose` in the auth-simplify pass.)

## Architecture / flow

```
Website /vote page (src/website/pages/vote/index.tsx)
  └─ no session → "Login with guild.host" → GET /api/vote/login
  └─ session    → GET /api/vote (talks + budget + my votes), POST /api/vote (toggle)

Worker (src/server/index.ts switch router)
  GET  /api/vote/login     routes/auth.ts authLogin    → redirect to guild authorize (state cookie)
  GET  /api/vote/callback  routes/auth.ts authCallback → exchange code, userinfo, set session cookie
  GET  /api/vote           routes/vote.ts voteGet       → { budget, used, talks[], myVotes[], closesAt }
  POST /api/vote           routes/vote.ts voteSubmit    → cast/remove a vote

Identity:   attendee's own OAuth token (scope profile:read) → userinfo → user id
Budget:     organizer token → /events/{slug}/attendees → userId→tier → ticket_tiers → budget
Org token:  oauth_tokens row, auto-refreshed + rotated (repositories/oauth-token.ts)
```

## Files (all new/changed on this branch)

Server:

- `src/server/configs/oauth.ts` — guild endpoint URLs, scope, EVENT_SLUG, cookie names/TTL.
- `src/server/configs/vote.ts` — `VOTE_CLOSES_AT`, `isVotingOpen()`.
- `src/server/helpers/session.ts` — `jose` HS256 `signSession`/`verifySession`, async
  `getUserId` (cookie in prod; `X-Dev-User` header fallback only when
  `ENVIRONMENT !== 'production'`).
- `src/server/helpers/cookies.ts` — shared `readCookie` (deduped from session.ts + auth.ts).
- `src/server/helpers/request.ts` — `parseRequest` (415/413/400/422 gauntlet, shared by c4p +
  vote) alongside the primitive `isJsonContentType`/`isWithinSize`/`parseBody`.
- `src/server/helpers/oauth.ts` — `buildAuthorizeUrl`, `exchangeCode`, `refreshToken`,
  `fetchUserInfo`. Still hand-rolled + stubbed; slated for `arctic` once the real guild flow lands.
- `src/server/repositories/oauth-token.ts` — `getOrgAccessToken`: valid-token passthrough,
  else refresh + persist rotated token; seeds from `GUILD_ORG_REFRESH_TOKEN`.
- `src/server/repositories/attendees.ts` — `resolveBudget(env, db, userId)`: paginated
  attendee fetch (org token), `lru.min` cache, joins `ticket_tiers`. null = not an attendee.
- `src/server/repositories/vote.ts` — `listTalks`, `listUserVotes`, `castVote` (budget +
  idempotent), `removeVote`.
- `src/server/routes/vote.ts`, `src/server/routes/auth.ts` — the four endpoints.
- `src/server/routes.ts`, `src/server/index.ts` — wiring + credentialed CORS.
- `src/server/types.ts` — `Env` additions (5 secrets + `ENVIRONMENT`).
- `resources/schema.sql` — `ticket_tiers`, `c4p_votes`, `oauth_tokens`.

Site:

- `src/website/pages/vote/index.tsx` — voting UI (login state, checkbox approval list,
  optimistic toggle, remaining-votes counter).

Tests:

- `test/server/routes/vote.test.ts` — session crypto, token refresh/rotation, route auth
  (401/403), budget limit, idempotent re-vote, unvote, 415/422, prod no-bypass.

Config: `.env.example` updated. `TODO.md` has the deploy checklist.

## State of play (updated 2026-07-07)

- `npm run typecheck`, `npm run lint`, `npm test` (9 files) all pass.
- **Committed** on `voting-system` (unsigned — 1Password SSH signer wouldn't run in the agent
  session; prior wip history is unsigned too, re-sign via `git rebase --exec 'git commit
--amend --no-edit -S'` if wanted): `refactor(voting): guild-only, jose sessions, parseRequest
  - richer talk cards`and`feat(voting): wire guild OAuth app scopes + dev.vars template`.
- **NEXT: the `/ticket` refactor — see the "⏭️ RESUME HERE" section at the top of `TODO.md`.**
  Approved, not started. It deletes the org-token machinery and bakes budget into the session.
- Real OAuth creds are in `.dev.vars` (gitignored). Rotate the client secret before go-live
  (pasted in plaintext chat).

## What's NOT done — see TODO.md

1. **Blocked on guild:** wait for Taz's "Log in with Guild" sign-in (~Mon 2026-06-29), then
   align `helpers/oauth.ts` + `routes/auth.ts` to the real flow (currently a stub).
2. **Blocked on access:** Guild admin (API key + manager OAuth) to read attendees; requested
   from the team. Fallback: collect emails in the purchase form.
3. Operational: register OAuth app, set 5 secrets, set `ALLOWED_ORIGIN`, seed `ticket_tiers`,
   `npm run db:init`, obtain the organizer refresh token, set the real `VOTE_CLOSES_AT`.
4. **Live verification once login exists:** the userinfo id field that joins the attendees list.
   `fetchUserInfo` tries `sub ?? id ?? slugId ?? rowId` — confirm which is correct.
5. Optional: logout, vote-tally admin read endpoint.

## Why guild.host (not Stripe) for attendees

Earlier the guild.host attendee list wasn't available, so the only way to know buyers was
Stripe — which sees the **buyer only**, not the guests on a multi-ticket order. PR #40 was
built under that limitation (Stripe webhook → buyer email → votes). Guild **now exposes the
full attendee list**, and each attendee carries their own `ticketOrder` tier, so the
"who bought what" cross-check is already per-attendee in guild data. That is why we use guild
OAuth + the attendees API, and treat #40's Stripe approach as a workaround for a gone
limitation.

## Multi-ticket / group purchases — RESOLVED (2026-06-26)

Policy: **each guest votes individually** with their own tier budget — and it works. Taz (guild
owner) confirmed: the buyer enters each guest's email, and **each guest creates their own Guild
account to claim** their ticket (and may use a different email than the buyer entered). So every
ticket holder becomes a separate attendee with their own email/data. No buyer-holds-all problem,
no manual fallback needed. (Earlier worry: the schema lets one attendee own N ticket items via
`ticketOrder.eventTicketOrderItems.totalCount`, but the claim flow makes each guest distinct.)

## Login depends on guild.host (BLOCKER)

"Log in with Guild" 3rd-party sign-in **does not exist yet** — the OAuth at
`guild.host/docs/developers/oauth` is private-API access only (per Taz). Taz will add it, est.
**Monday 2026-06-29**, shape TBD. Our `helpers/oauth.ts` (`buildAuthorizeUrl`/`exchangeCode`/
`fetchUserInfo`) + `routes/auth.ts` assume a standard authorization-code flow; they are a
**stub** until the real flow ships — revisit then. Locally, auth is exercised via the
`X-Dev-User` header. Also still need Guild + Stripe admin access (Guild API key + manager OAuth)
to read attendees; requested from the team, fallback is collecting emails in the purchase form.

## Stealing from PR #40 (branch feat/c4p-voting-quantity-tiers)

His model: email + 4-digit code login (JWT 15m + rotating refresh, `jose`), budget from Stripe
`checkout.session.completed` (quantity × tier weight), `users-batch` admin endpoint.

Taken so far:

- **`status = 2` = votable.** Concrete meaning for the undocumented `talks.status`. Now
  filtered in `listTalks` via `VOTABLE_TALK_STATUS` (`configs/vote.ts`).
- **`parseRequest` helper** (`helpers/request.ts`) — DRYs the 415/413/400/422 gauntlet the c4p +
  vote routes repeated. (Dropped his `RouteContext`/`cors` coupling — the helper just returns
  `{ data }` or `{ error, status }` and the route builds the response.)
- **Richer talk cards** — `listTalks` + the `/api/vote` payload now carry `duration` +
  `audience_level`; the `/vote` page labels them via the existing `durationOptions` /
  `audienceLevels` arrays. (Kept our `talks` + `myVotes` shape; did not adopt his
  `talks`/`votedTalkIds` split.)

Rejected (conflicts with our guild model — kept here so the option isn't lost):

- **Stripe-webhook-derived budget** (`checkout.session.completed` → buyer email +
  quantity×tier-weight → upsert `users`). Would kill our org-token + OAuth-refresh +
  attendees-fetch + lru machinery AND the userinfo→attendee id-join risk. We don't take it
  because it is **buyer-only** (no group guests) and guild now gives the full per-attendee
  list. The group-ticket question is now RESOLVED (each guest claims their own account), so the
  "buyer holds all" condition that would have made this Stripe model the fallback no longer
  applies — keep it only as a last resort if Guild access never materializes.
- **Repurchase accumulation** (`ON CONFLICT(email) DO UPDATE SET votes_allowed =
votes_allowed + excluded`). N/A in our model: budget is a live tier lookup, not a persisted
  per-purchase sum, so there's nothing to accumulate. Only relevant if we adopt the Stripe
  fallback above.

Worth taking later (model-compatible, not yet done):

- His `getEligibleTalks` computes `has_voted` per talk in one query — cleaner than our
  two-query `voteGet`. Skipped for now: it churns the response shape + test mock for a micro-opt.
- Explicit vote status codes: `403` no votes left, `409` already voted, `404` retract-not-found.
  Ours collapses to `422` + idempotent re-vote. His is clearer for the UI; a semantics choice
  (skipped — would break current tests, no sign-off).
- Dev seed script (his `scripts/seed.ts`): seed talks + `ticket_tiers` so local voting is
  testable without the `X-Dev-User` curl dance. We have none. (Skipped — net-new wrangler
  plumbing, not a quick win.)
- `schemas.ts` centralizing typed response shapes. Minor.
- His richer frontend: `src/website/components/voting/*`, `pages/voting/*`, `hooks/voting/*`,
  full i18n. Ours is one page.
- `charge.refunded` → revoke votes. N/A — Stripe is removed; the webhook stub is deleted.

Do NOT take: 4-digit `Math.random()` code (weak, 10k space, not crypto-random); hardcoded
early-bird date for tier detection (we read the real tier from guild).

## Gotchas for the next session

- Deps may not be installed — run `npm ci` first (typecheck/test need it).
- `X-Dev-User` is a dev-only auth shortcut; it returns null in production by design. Do not
  "fix" it to work in prod.
- The attendee tier map and the rate limiter are per-isolate in-memory caches (Cloudflare runs
  many isolates) — intentional, marked with `ponytail:` comments. Don't treat them as global.
- guild.host OAuth: authorize `https://guild.host/oauth/authorize`, token
  `https://guild.host/api/oauth/token`, userinfo `https://guild.host/api/oauth/userinfo`,
  attendees `https://guild.host/api/next/events/{slug}/attendees` (needs organizer bearer +
  manage permission). Swagger: `~/Downloads/api-1.json`. OAuth docs:
  `https://guild.host/docs/developers/oauth`.
- User runs caveman + ponytail modes (terse output, laziest-correct solution). Keep new code
  minimal; mark deliberate shortcuts with `ponytail:` comments.
