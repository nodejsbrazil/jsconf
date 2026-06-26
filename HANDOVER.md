# Handover — JSConf BR attendee voting system

Context for a fresh Claude session picking up this work. Branch: `voting-system`.

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
- **Stripe unused for voting.** It knows only the buyer, and votes are per individual attendee.
- **Voting runs for months**, so the organizer token (24h access / 30d rotating refresh) is
  auto-refreshed and persisted in D1 — see `oauth_tokens` + `getOrgAccessToken`.
- **Vote model:** approval voting — pick up to `budget` distinct talks, toggle on/off until
  `VOTE_CLOSES_AT`. All C4P submissions are votable (no `talks.status` filter).
- **Session:** HMAC-signed cookie (`vote_session`), `SameSite=None; Secure` so it survives the
  cross-subdomain fetch from the website to the API. No DB session store.

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
- `src/server/helpers/session.ts` — HMAC `signSession`/`verifySession`, async `getUserId`
  (cookie in prod; `X-Dev-User` header fallback only when `ENVIRONMENT !== 'production'`).
- `src/server/helpers/oauth.ts` — `buildAuthorizeUrl`, `exchangeCode`, `refreshToken`,
  `fetchUserInfo`.
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

## State of play

- `npm run typecheck`, `npm run lint`, `npm test` (10 files) all pass.
- Nothing is committed — review the diff and commit when ready (conventional commits, no
  Claude attribution per user preference; always branch, never push to main).

## What's NOT done — see TODO.md

1. Operational: register OAuth app, set 5 secrets, set `ALLOWED_ORIGIN`, seed `ticket_tiers`,
   `npm run db:init`, obtain the organizer refresh token, set the real `VOTE_CLOSES_AT`.
2. **One live verification** (cannot be done without a registered app + real login): the
   userinfo id field that joins the attendees list. `fetchUserInfo` tries
   `sub ?? id ?? slugId ?? rowId` — confirm which is correct. If none join, the
   identity→tier mapping breaks and needs rethinking.
3. Optional: logout, vote-tally admin read endpoint, refund→revoke.

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
