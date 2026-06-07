# SSO across `*.comprom.org` — design + migration plan

> **Status:** SHIPPED (2026-06-07).
> **Branch:** `feat/sso-parent-domain-cookie`.
> **Replaces:** the per-service CF Access setup standing in front of
> `comms-worker` (apps `comms-admin`, `comms-public`,
> `comms-webhooks` — all deleted in the same commit).

This doc started as a plan for a fresh session. The plan was
implemented in one go and the file now documents the live
architecture.

---

## 1. Goal

One sign-in covers every subdomain of `comprom.org` (today: `admin.`,
`lists.`; tomorrow: `logs.`, `analytics.`, anything we add). No CF
Access. No GitHub OAuth app per service. The admin SPA's existing
GitHub PKCE flow is the only user-facing sign-in.

## 2. Why not CF Access

We already shipped CF Access for `comms-worker`. It works but adds
moving parts that don't compose with the rest of the platform:

- second identity layer (Zero Trust org `comprom`) alongside the
  GitHub OAuth the admin SPA already uses
- separate cookie scope (`comprom.cloudflareaccess.com`) so the SSO
  doesn't carry to `admin.comprom.org`
- separate policy storage (CF Access JSON) drift from the GitHub
  team that's the actual source of truth for who's an admin
- a free-tier Zero Trust team caps at 50 users, fine today but a soft
  scaling ceiling

The user's call was unambiguous: «У нас есть admin-website, там уже
вся авторизация есть. В чём проблема шарить эту авторизацию с
сервисом рассылок?» — exactly right. Use what's already there.

## 3. Architecture

```
            ┌───────────────────────────────┐
            │  GitHub OAuth (PKCE flow —    │
            │  ONLY in admin SPA, unchanged)│
            └────────────────┬──────────────┘
                             │ gh_token (user-side)
                             ▼
   ┌─────────────────────────────────────────────────┐
   │  admin.comprom.org   (Vue 3 SPA)                │
   │  - gh_token in localStorage (kept — needed for  │
   │    direct GitHub API calls: commits, PRs, etc.) │
   │  - calls auth.comprom.org/auth/session once     │
   │    after PKCE completes                         │
   └────────────────┬────────────────────────────────┘
                    │ POST /auth/session
                    │ Authorization: Bearer <gh_token>
                    ▼
   ┌─────────────────────────────────────────────────┐
   │  auth.comprom.org   (new CF Worker)             │
   │  1. GET https://api.github.com/user             │
   │     → resolve login                             │
   │  2. GET .../orgs/communist-prometheus/teams/    │
   │     admins/memberships/{login}                  │
   │     → require state == "active"                 │
   │  3. sign HS256 JWT { sub, login, teams, iat,    │
   │     exp, aud: "comprom-sso" }                   │
   │  4. Set-Cookie: comprom_session=<JWT>;          │
   │     Domain=.comprom.org; HttpOnly; Secure;      │
   │     SameSite=Lax; Path=/; Max-Age=86400         │
   │  5. respond 200 with { login, teams, expires }  │
   └────────────────┬────────────────────────────────┘
                    │ cookie auto-rides on every
                    │ subsequent *.comprom.org fetch
                    ▼
   ┌─────────────────────────────────────────────────┐
   │  lists.comprom.org   (comms-worker, refactored) │
   │  - require-session middleware reads cookie      │
   │  - verifyJwt(secret) + claims.teams ⊇ ["admins"]│
   │  - on miss → 401                                │
   │  -- existing routes unchanged below middleware  │
   └─────────────────────────────────────────────────┘
                    ▲
                    │ same shape applies to any future
                    │ worker on *.comprom.org
```

The cookie is the bus. Every protected resource on `*.comprom.org`
reads it. Issuance is centralised; verification is per-worker.

## 4. JWT shape

```json
{
  "sub":   "undeadliner",                   // github login
  "login": "undeadliner",                   // alias of sub for handler ergonomics
  "teams": ["admins"],                      // memberships in communist-prometheus org
  "iat":   1780827572,                      // seconds
  "exp":   1780913972,                      // iat + 24h
  "aud":   "comprom-sso",                   // pinned audience string
  "iss":   "auth.comprom.org"               // pinned issuer
}
```

- **alg:** HS256
- **secret:** `JWT_SECRET` env var, the SAME on `auth-worker`,
  `comms-worker`, and every future worker on `*.comprom.org`. Generated
  fresh as part of this rollout (64-byte base64) — has no relation to
  log-collector's `JWT_SECRET`.
- **ttl:** 24h. Refresh by the SPA re-calling `/auth/session` (it
  still has the gh_token in localStorage) — no refresh token needed.
- **audience:** distinct from `log-collector`'s JWT audience (`"log-collector"`)
  so tokens can't cross-replay between fleets.

## 5. Cookie shape

| attr | value | reason |
|---|---|---|
| name | `comprom_session` | namespaced, doesn't collide with cf cookies |
| Domain | `.comprom.org` | parent — covers every subdomain |
| Path | `/` | every endpoint |
| HttpOnly | yes | SPA must NOT read it directly (XSS containment) |
| Secure | yes | all `*.comprom.org` is HTTPS via CF |
| SameSite | `Lax` | first-party only; safe with Bearer header on cross-origin XHR |
| Max-Age | `86400` (24h) | matches JWT exp |

The SPA still gets the JWT body in the JSON response so it can read
`{ login, teams, expires }` and render UI. The signed token itself
lives only in the cookie.

## 6. GitHub team check

Source of truth = GitHub org `communist-prometheus` team `admins`.

- create team (one-time): `gh api orgs/communist-prometheus/teams -X POST -f name=admins -f description='Admin surface allowlist' -f privacy=closed`
- seed: `gh api orgs/communist-prometheus/teams/admins/memberships/{login} -X PUT`
- check (auth-worker, per request):
  `GET /orgs/communist-prometheus/teams/admins/memberships/{login}` →
  body `state` must be `"active"` (not `"pending"`). Non-200 ⇒ not a
  member.

The team check is the only GitHub call we make per session; cache the
verified login → team list pair in a worker-isolate Map for 5 min so
repeated SPA-issued `/auth/session` calls don't hammer GH.

The org name is locked into the auth-worker as a `vars.GITHUB_ORG`
binding — single source.

## 7. CORS

The SPA on `admin.comprom.org` issues XHR to `auth.comprom.org` and
`lists.comprom.org`. Both must:

```
Access-Control-Allow-Origin: https://admin.comprom.org
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Vary: Origin
```

The `Origin` value MUST echo the request origin from a fixed allowlist
(`https://admin.comprom.org` plus any dev hosts) — never `*` when
`Allow-Credentials: true`. Browser will silently drop the cookie
otherwise.

SPA fetches use `credentials: 'include'`.

## 8. Files to create

```
services/auth-worker/
  wrangler.jsonc                     # route: auth.comprom.org
  src/
    index.ts                         # entry → app.fetch
    app.ts                           # Hono wiring
    bindings.ts                      # Env type + Vars type
    health.ts                        # GET /health
    cors.ts                          # CORS middleware
    cookie.ts                        # Set-Cookie / Clear-Cookie builders
    gh-user.ts                       # fetchUserLogin, fetchTeamMembership
    jwt/
      base64url.ts                   # ← copy from log-collector
      hmac-key.ts                    # ← copy from log-collector
      types.ts                       # { sub, login, teams, iat, exp, aud, iss }
      sign.ts                        # signSessionJwt
      verify.ts                      # verifySessionJwt
    session-handler.ts               # POST /auth/session
    logout-handler.ts                # POST /auth/logout
    refresh-handler.ts               # POST /auth/refresh (re-runs team check)
  test/
    session-handler.test.ts
    cookie.test.ts
    gh-user.test.ts
    jwt-roundtrip.test.ts
```

## 9. Files to modify

```
services/comms-worker/src/
  app.ts                             # swap requireAccess → requireSession
  bindings.ts                        # drop AccessClaims; add SessionClaims
  middleware/require-session.ts      # NEW — reads cookie, verifies JWT
  auth/session-verify.ts             # NEW — wraps shared jwt/verify
  (delete) middleware/require-access.ts
  (delete) middleware/require-access.test.ts
  (delete) auth/cf-access.ts
  (delete) auth/cf-access.test.ts
  (delete) auth/claims-check.ts
  (delete) auth/jwks-cache.ts
  (delete) auth/base64url.ts          # if not used elsewhere
  wrangler.jsonc                     # drop CF_ACCESS_* mentions

src/api/  (admin SPA — exact paths TBD on read)
  fetcher wrapping calls to *.comprom.org services:
    - add credentials: 'include'
    - on 401, attempt one POST /auth/session refresh, retry
  PKCE post-callback hook:
    - after gh_token lands, immediately POST /auth/session to mint cookie
  storage:
    - read { login, teams } from the /auth/session response (NOT cookie)
    - drive nav / RBAC UI off teams[]
```

## 10. Provisioning

Run from a fresh laptop with `.tmp/wrangler.token` (or the
`CLOUDFLARE_API_TOKEN` line from `admin-website/.env`) live.

```bash
# 1. Generate the SSO JWT secret (64 random bytes, base64) and put it
#    into BOTH workers. Pick the value once; reuse on every push.
SSO_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# 2. Push to auth-worker (created in next step).
echo -n "$SSO_SECRET" \
  | CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=c5b8f26375cab6f66eab9981fe3b6d3a \
    npx wrangler --config services/auth-worker/wrangler.jsonc secret put JWT_SECRET

# 3. Deploy auth-worker.
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=c5b8f26375cab6f66eab9981fe3b6d3a \
  npx wrangler --config services/auth-worker/wrangler.jsonc deploy

# 4. Push SAME secret to comms-worker.
echo -n "$SSO_SECRET" \
  | CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=c5b8f26375cab6f66eab9981fe3b6d3a \
    npx wrangler --config services/comms-worker/wrangler.jsonc secret put JWT_SECRET

# 5. Redeploy comms-worker with the new middleware.
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=c5b8f26375cab6f66eab9981fe3b6d3a \
  npx wrangler --config services/comms-worker/wrangler.jsonc deploy
```

The wrangler.jsonc for auth-worker uses a custom domain, same shape
as comms-worker, so CF auto-creates the DNS A record:

```jsonc
{
  "name": "auth-worker",
  "compatibility_date": "2026-06-01",
  "main": "src/index.ts",
  "routes": [{ "pattern": "auth.comprom.org", "custom_domain": true }],
  "vars": {
    "VERSION": "0.1.0",
    "GITHUB_ORG": "communist-prometheus",
    "GITHUB_ADMIN_TEAM": "admins",
    "ALLOWED_ORIGIN": "https://admin.comprom.org",
    "COOKIE_DOMAIN": ".comprom.org"
  }
}
```

## 11. Cleanup checklist (after smoke passes)

Cloudflare Access app IDs (already provisioned earlier in this work):

| app | uuid | action |
|---|---|---|
| comms-admin | `8e38eb79-5c99-4707-9099-95b319359788` | DELETE |
| comms-public | (look up via `/access/apps`) | DELETE |
| comms-webhooks | (look up via `/access/apps`) | DELETE |

```bash
# Pattern for each app:
curl -X DELETE \
  -H "X-Auth-Email: igor_ganov@live.ru" \
  -H "X-Auth-Key: <Global API Key from admin-website/.env>" \
  https://api.cloudflare.com/client/v4/accounts/c5b8f26375cab6f66eab9981fe3b6d3a/access/apps/<uuid>
```

Then remove the now-orphan worker secrets:

```bash
# CF API direct PUT with empty value, OR via wrangler:
npx wrangler --config services/comms-worker/wrangler.jsonc secret delete CF_ACCESS_AUD
npx wrangler --config services/comms-worker/wrangler.jsonc secret delete CF_ACCESS_TEAM
```

`.dev.vars` and `.secrets.local` in `services/comms-worker/` should
have the `CF_ACCESS_*` lines deleted at the same commit.

## 12. Smoke test (end-to-end after deploy)

```bash
# 1. Get a gh_token with read:org scope (the admin SPA does this via PKCE).
#    For manual smoke use a personal access token instead.
GH_TOKEN=ghp_...

# 2. Mint a session cookie.
curl -i -X POST https://auth.comprom.org/auth/session \
  -H "Authorization: Bearer $GH_TOKEN" \
  -c /tmp/cookies.txt

# Expected: 200, body { "login": "...", "teams": ["admins"], "expires": ... },
#           Set-Cookie: comprom_session=...; Domain=.comprom.org; HttpOnly; Secure; SameSite=Lax

# 3. Use the cookie to hit the comms API.
curl -i https://lists.comprom.org/api/subscribers -b /tmp/cookies.txt

# Expected: 200 (or 200 with empty list — not 401).
```

## 13. Tests to write

- `auth-worker/session-handler.test.ts`: happy path, GH token rejects,
  non-member rejects, pending membership rejects.
- `auth-worker/cookie.test.ts`: every attribute on the Set-Cookie
  matches §5 exactly. Logout cookie has `Max-Age=0`.
- `auth-worker/gh-user.test.ts`: GH 404 → not-member; GH 200 with
  `state: "pending"` → not-member; GH 200 with `state: "active"` →
  member.
- `comms-worker/require-session.test.ts`: missing cookie → 401, bad
  signature → 401, expired → 401, valid + teams contains "admins" →
  next() runs.

## 14. Rollback

If the new flow breaks in prod:

1. CF Access apps are not deleted until §11. Until then, the old
   Zero-Trust path through `lists.comprom.org` still gates the worker
   at the edge — restoring is a single `git revert <commit>` on the
   `wrangler.jsonc` route and `comms-worker/src/app.ts`.
2. Cookie can be invalidated cluster-wide by rotating `JWT_SECRET` —
   every signed token immediately fails verify.

## 15. Open items the next session should confirm

- Real DNS owner for `comprom.org` is the same CF account — yes
  (account id `c5b8f26375cab6f66eab9981fe3b6d3a`). Custom domain on
  `auth.comprom.org` will provision automatically.
- The `admins` team in `communist-prometheus` may not exist yet; the
  next session must create it and seed at minimum `undeadliner` + any
  other current org admins before flipping prod.
- The admin SPA hostname is assumed to be `admin.comprom.org`. Verify
  on first read (config + Pages routing). If staging is on a different
  host (e.g. a `.pages.dev` URL), include it in `ALLOWED_ORIGIN` as a
  comma-list and split in CORS middleware.
