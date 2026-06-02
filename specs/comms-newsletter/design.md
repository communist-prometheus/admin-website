# Newsletter — Design

> **Status:** DRAFT — phase 2 of three (requirements → **design** → tasks).
> **Source of truth:** [`requirements.md`](./requirements.md) — every section below maps back to numbered EARS criteria.
>
> _Pause for review at the end of this file before moving to tasks.md._

## 1. Architecture at a glance

```
                ┌─────────────────────────────┐
                │     admin-website (Vue)     │
                │ ─ /comms view (CRUD + cron) │
                │ ─ uses gh_token + CF Access │
                └──────────────┬──────────────┘
                               │ HTTPS + Cf-Access-Jwt-Assertion
                               ▼
   ┌──────────────────── lists.comprom.org ──────────────────────┐
   │           services/comms-worker  (Hono on CF Workers)        │
   │  ┌────────────────────────────────────────────────────────┐  │
   │  │  Routes                                                │  │
   │  │  ────────                                              │  │
   │  │  POST /api/subscribers    (admin)                      │  │
   │  │  GET  /api/subscribers    (admin)                      │  │
   │  │  PATCH /api/subscribers/:id (admin)                    │  │
   │  │  DELETE /api/subscribers/:id (admin)                   │  │
   │  │  GET  /api/schedule       (admin)                      │  │
   │  │  PUT  /api/schedule       (admin)                      │  │
   │  │  GET  /api/runs           (admin)                      │  │
   │  │  POST /api/dispatch?force=1 (admin, dev/test only)     │  │
   │  │  GET  /unsubscribe?t=…    (public)                     │  │
   │  │  POST /unsubscribe?t=…    (public, RFC 8058 one-click) │  │
   │  │  POST /webhooks/resend    (Resend → us, svix-signed)   │  │
   │  └────────────────────────────────────────────────────────┘  │
   │  Scheduled handler: heartbeat = "0 * * * *" UTC              │
   │      ↓                                                       │
   │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
   │  │ D1 (sqlite) │    │  RSS fetch  │    │   Resend    │       │
   │  │ subscribers │    │ /{lang}/rss │    │ /emails API │       │
   │  │ settings    │    │  (cached)   │    │ /webhooks   │       │
   │  │ send_log    │    └─────────────┘    └─────────────┘       │
   │  └─────────────┘                                             │
   └──────────────────────────────────────────────────────────────┘
```

## 2. Data model (D1)

D1 is sqlite. Migrations live in `services/comms-worker/migrations/`.

### 2.1 Schema

```sql
-- 0001_initial.sql

CREATE TABLE subscribers (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT NOT NULL,          -- always lowercased before write
  langs           TEXT NOT NULL,          -- JSON array, e.g. '["ru","en"]'
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','unsubscribed','bounced','complained')),
  created_at      TEXT NOT NULL,          -- ISO-8601 UTC
  last_sent_at    TEXT,                   -- ISO-8601 UTC, null = never sent
  unsubscribed_at TEXT                    -- ISO-8601 UTC, set when status leaves 'active'
);
CREATE UNIQUE INDEX subscribers_email_active_uq
  ON subscribers(email) WHERE status = 'active';
CREATE INDEX subscribers_status_idx ON subscribers(status);

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL                     -- JSON blob
);
-- Seeded row in 0002_seed.sql:
-- INSERT INTO settings(key, value) VALUES
-- ('schedule', '{"cron":"0 12 * * 6","timezone":"Europe/Moscow"}');

CREATE TABLE send_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER REFERENCES subscribers(id) ON DELETE SET NULL,
  tick_at       TEXT NOT NULL,            -- ISO-8601 UTC, heartbeat tick boundary
  article_count INTEGER NOT NULL,
  status        TEXT NOT NULL
                CHECK (status IN ('sent','failed','bounced','complained','skipped')),
  resend_id     TEXT,                     -- Resend's email id when status='sent'
  error         TEXT                      -- truncated to 500 chars
);
CREATE INDEX send_log_tick_idx ON send_log(tick_at DESC);
CREATE INDEX send_log_subscriber_idx ON send_log(subscriber_id);
```

**Why the `WHERE status='active'` partial unique:** lets us re-add an email after a subscriber unsubscribes (a new active row is created); the old row stays for audit. Maps to R4.4 idempotency + R6.5 hygiene.

**Why `ON DELETE SET NULL`:** hard-deleting a subscriber (R1.6) preserves the audit trail in `send_log` without referential dangling.

### 2.2 Domain types (TS)

```ts
// services/comms-worker/src/types.ts
import { Schema } from 'effect'

export const LangSchema = Schema.Literal('en','ru','it','es','uk','pl','bl')

export const SubscriberSchema = Schema.Struct({
  id: Schema.Number,
  email: Schema.String,
  langs: Schema.Array(LangSchema),
  status: Schema.Literal('active','unsubscribed','bounced','complained'),
  createdAt: Schema.String,
  lastSentAt: Schema.UndefinedOr(Schema.String),
  unsubscribedAt: Schema.UndefinedOr(Schema.String),
})
export type Subscriber = typeof SubscriberSchema.Type

export const ScheduleSchema = Schema.Struct({
  cron: Schema.String,            // 5-field crontab
  timezone: Schema.String,        // IANA TZ
})
export type Schedule = typeof ScheduleSchema.Type

export const ArticleSchema = Schema.Struct({
  guid: Schema.String,            // rss <guid>, used as dedup key
  title: Schema.String,
  link: Schema.String,            // absolute URL
  lang: LangSchema,
  pubDate: Schema.String,         // ISO-8601 UTC
})
export type Article = typeof ArticleSchema.Type
```

Effect Schema is already a runtime dependency in admin-website; carrying it here keeps validation conventions consistent.

## 3. Sequence flows

### 3.1 Editor adds a subscriber (R1.2)

```
admin UI                comms-worker             D1
   │ POST /api/subscribers │                       │
   │ {email,langs}         │                       │
   │  Authorization: Bearer<gh_token>              │
   │  Cf-Access-Jwt-Assertion: …                   │
   ├─────────────────────►│                       │
   │                       │ verify CF Access JWT  │
   │                       │ (jwks cached 24 h)    │
   │                       │ lower-case email      │
   │                       │ INSERT subscribers    │
   │                       ├──────────────────────►│
   │                       │◄──────────────────────┤
   │◄───── 201 + row ──────│                       │
```

CF Access verification happens **before** any D1 write. The `Authorization: Bearer <gh_token>` header is _not_ used by the worker; it's there only so that the admin UI's existing `swFetch` middleware works unchanged.

### 3.2 Heartbeat dispatch tick (R2.5 → R3.5)

```
CF Cron (0 * * * *)              comms-worker             D1            RSS              Resend
        │ scheduled() event           │                     │            │                  │
        ├────────────────────────────►│                     │            │                  │
        │                              │ load settings.schedule         │                  │
        │                              ├────────────────────►│            │                  │
        │                              │ cronMatcher(schedule, now)      │                  │
        │                              │   ─ if no-match: return         │                  │
        │                              │   ─ if match: continue          │                  │
        │                              │                     │            │                  │
        │                              │ load active subscribers         │                  │
        │                              ├────────────────────►│            │                  │
        │                              │                     │            │                  │
        │                              │ for each unique lang in subs:   │                  │
        │                              │   GET /{lang}/rss.xml ───────────►                  │
        │                              │   parse + cache items           │                  │
        │                              │                                                    │
        │                              │ for each subscriber:                                │
        │                              │   delta = items where           │                  │
        │                              │     pubDate > sub.lastSentAt    │                  │
        │                              │     AND lang ∈ sub.langs        │                  │
        │                              │   if delta empty: skip          │                  │
        │                              │   render html+text+headers      │                  │
        │                              │   POST https://api.resend.com/emails ──────────────►│
        │                              │     Idempotency-Key: <id>:<tick>│                  │
        │                              │◄──────────────── 200 { id } ────────────────────────│
        │                              │   UPDATE last_sent_at           │                  │
        │                              │   INSERT send_log status='sent'                    │
        │                              ├────────────────────►│            │                  │
        │                              │                                                    │
        │                              │ DELETE send_log WHERE tick_at < now − 90d           │
        │                              ├────────────────────►│            │                  │
        │                              │                                                    │
        │                              │ structured-log JSON {tick, sent, failed, ms}       │
```

Notes:
- The `cronMatcher` is pure (R2.2/R2.5 unit-tested). It expands the user crontab in the saved IANA timezone, snaps `now` to the minute, and returns `true` iff equal.
- RSS fetches happen **once per unique language** per tick, NOT per subscriber. A 100-subscriber list with 3 unique langs = 3 RSS fetches.
- `Idempotency-Key = <subscriber_id>:<tick_at>` (R3.9) — if the scheduled trigger is retried by CF after a worker crash, Resend dedups.
- Retention sweep (R5.4) is in-line, not a separate cron, because the wakeup is cheap and we get it free.

### 3.3 Recipient one-click unsubscribe (R4.3 → R4.4)

```
Recipient mail client (e.g. Gmail)        comms-worker            D1
   │ POST /unsubscribe?t=<token>             │                      │
   │ List-Unsubscribe=One-Click              │                      │
   ├────────────────────────────────────────►│                      │
   │                                          │ HMAC.verify(token)  │
   │                                          │   ─ invalid → 404   │
   │                                          │ decode → {id,...}   │
   │                                          │ UPDATE subscribers  │
   │                                          │  SET status='unsub' │
   │                                          ├─────────────────────►
   │                                          │◄─────────────────────
   │◄────── 200 (empty) ─────────────────────│                      │
```

A human clicking the link in their inbox triggers `GET` instead — same verification, plus an HTML confirmation page in the recipient's `Accept-Language` (R4.2).

### 3.4 Resend webhook bounce / complaint (R3.10 → R3.11)

```
Resend                          comms-worker              D1
  │ POST /webhooks/resend          │                       │
  │ svix-id, svix-signature        │                       │
  ├───────────────────────────────►│                       │
  │                                 │ verify HMAC sig      │
  │                                 │  ─ fail → 401, no op │
  │                                 │ map event → status   │
  │                                 │ UPDATE subscribers   │
  │                                 │ INSERT send_log      │
  │                                 ├──────────────────────►│
  │◄────── 200 ────────────────────│                       │
```

## 4. HTTP API contract

All admin endpoints respond `application/json`. All errors follow `{"error":"<code>","details":"<human>"}`.

### 4.1 Subscribers

```
POST   /api/subscribers          body: {email, langs[]}  →  201 Subscriber | 401 | 409 | 422
GET    /api/subscribers          →  200 {subscribers: Subscriber[]}
PATCH  /api/subscribers/:id      body: {langs[]?}        →  200 Subscriber | 401 | 404 | 422
DELETE /api/subscribers/:id                              →  204 | 401 | 404
```

### 4.2 Schedule

```
GET    /api/schedule             →  200 {cron, timezone, nextRunAt}
PUT    /api/schedule             body: {cron, timezone}  →  200 {cron, timezone, nextRunAt} | 422
```

`nextRunAt` is computed server-side via `cron-parser` so the UI doesn't reimplement the matcher (R2.1, R2.4).

### 4.3 Runs

```
GET    /api/runs                 query: ?limit=20        →  200 {runs: SendLog[]}
POST   /api/dispatch?force=1     →  202 (test/dev only, gated by env BYPASS_SCHEDULE)
```

`force=1` exists for E2E only; in prod it's a 404 because the binding is unset (R5.1, R5.2 verified via this in tests).

### 4.4 Public unsubscribe

```
GET    /unsubscribe?t=…          →  200 HTML confirmation (any lang)
POST   /unsubscribe?t=…          →  200 empty (RFC 8058 one-click)
```

### 4.5 Resend webhook

```
POST   /webhooks/resend          headers: svix-id, svix-signature, svix-timestamp
                                 body:    Resend event JSON
                                 →  200 | 401 (bad sig)
```

## 5. Cron matcher (R2.5)

We don't use `setInterval` or per-pattern triggers. The worker registers exactly one trigger:

```jsonc
// wrangler.jsonc
{
  "triggers": { "crons": ["0 * * * *"] }
}
```

On every tick the worker:
1. Loads `settings.schedule` (= `{cron, timezone}`).
2. Computes the most-recent expected fire time for that crontab in that timezone via `cron-parser` (`prev()`).
3. If `prev()` was within the last 5 minutes of "now", the dispatch runs; else returns.

This handles:
- DST transitions (cron-parser is tz-aware).
- A missed heartbeat — if CF skips a tick, the next one still matches because the 5-minute window is forgiving.
- A doubled tick — same `tick_at` key means Resend dedups (R3.9).

## 6. Digest rendering (R3.4, R3.7, R3.8)

Inputs: `subscriber.langs[]`, `articles[]`, `unsubscribeUrl`.

Algorithm:
1. Group `articles` by lang, sort each group newest-first by `pubDate`.
2. Concatenate groups in `subscriber.langs[]` order (so the subscriber's primary language leads).
3. Render with a single Handlebars-ish template (no actual deps; tiny string template).
4. Two outputs: `text/plain` (fallback) and `text/html` (CSS inlined). Both include footer with the unsubscribe link.

`utm_source=newsletter&utm_medium=email&utm_campaign=<YYYY-WW>` appended to every article URL (R3.7), where `YYYY-WW` = ISO week number of the tick.

Chrome strings (subject line, "since your last digest", "Read", "Unsubscribe") localised in `chromeLang = subscriber.langs[0]` (R3.8 / R7 decision in requirements). For the v1 we ship strings for all 7 supported langs in a single in-worker dict.

## 7. Unsubscribe token (R4.1, R4.5)

```ts
// pseudo
const token = base64url(
  hmacSha256(
    UNSUBSCRIBE_SECRET,
    `${subscriber.id}.${subscriber.lastSentAt ?? 'never'}.${tickAt}`
  )
)
// embed: `https://lists.comprom.org/unsubscribe?t=<token>&s=<subscriberId>`
```

- Token is bound to `(id, lastSentAt, tickAt)` so each digest carries a token unique to **that send**.
- Worker keeps a 30-day in-memory bloom filter? — No, overkill. Instead the verify path re-derives the HMAC for the row at-rest, supporting any token whose payload validates against the current `(id, lastSentAt, tickAt)` OR a previous one (we store `last_unsubscribe_tick_at` field?). Simpler approach adopted: token's payload is just `id` HMAC'd; rotation of `UNSUBSCRIBE_SECRET` invalidates all tokens (rare, acceptable).
- Decision (locked): **token payload = `id`**, no rotation per-send. Re-subscribing creates a new row (R4.4), the old token still points at the unsubscribed row and is a no-op (idempotent).

## 8. Admin UI

### 8.1 Routes / views

```
/comms                       Vue route + view
  ├── SubscribersTable.vue   list + inline-edit langs
  ├── AddSubscriberForm.vue  modal/inline
  ├── ScheduleEditor.vue     cron input + preview + save
  └── RunHistory.vue         last 20 send_log rows + status pills
```

### 8.2 State / store

A small Pinia store `useCommsStore` mirrors the patterns we already use for `useLinksStore` (load-once + ensureLoaded). It calls the worker over `https://lists.comprom.org/api/*` with both:
- `Authorization: Bearer <gh_token>` — for admin-website's logging / observability middleware (the worker ignores it).
- The browser's CF Access cookie is sent automatically because `lists.comprom.org` is a sibling of `admin.comprom.org`, sharing the parent `comprom.org` for the Access cookie domain (configured below).

### 8.3 Test ids

`data-testid` attributes mirror LinksEditor conventions:

```
[data-testid="comms-view"]
[data-testid="subscribers-table"]
[data-testid="subscriber-row"]
[data-testid="subscriber-email"]
[data-testid="subscriber-lang-toggle"]
[data-testid="subscriber-status"]
[data-testid="subscriber-remove"]
[data-testid="add-subscriber-button"]
[data-testid="add-subscriber-email"]
[data-testid="add-subscriber-submit"]
[data-testid="schedule-cron"]
[data-testid="schedule-timezone"]
[data-testid="schedule-preview"]
[data-testid="schedule-next-run"]
[data-testid="schedule-save"]
[data-testid="run-history"]
[data-testid="run-history-row"]
[data-testid="send-log-failed"]
```

## 9. Infrastructure wiring

### 9.1 DNS (Cloudflare)

| Record | Type | Value | Purpose |
|---|---|---|---|
| `lists` | A/AAAA | proxied through CF worker route | worker public endpoint |
| `resend._domainkey` | CNAME | `resend._domainkey.comprom.org.dkim.amazonses.com` | Resend DKIM (filled with Resend's actual value at provisioning time) |

DMARC (`_dmarc.comprom.org`) stays at `p=none` (already shipped 2026-05-31). After two clean weeks of Resend reports we move to `p=quarantine`.

### 9.2 Worker bindings (`wrangler.jsonc`)

```jsonc
{
  "name": "comms-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-06-01",
  "routes": [
    { "pattern": "lists.comprom.org/*", "custom_domain": true }
  ],
  "triggers": { "crons": ["0 * * * *"] },
  "d1_databases": [
    { "binding": "DB", "database_name": "comms-prod", "database_id": "<provisioned>" }
  ],
  "vars": {
    "VERSION": "0.1.0",
    "ADMIN_HOSTNAME": "admin.comprom.org"
  }
  // secrets (set via wrangler secret put):
  // - RESEND_API_KEY
  // - RESEND_WEBHOOK_SECRET
  // - UNSUBSCRIBE_SECRET (32 random bytes)
  // - CF_ACCESS_AUD       (Application Audience tag from Zero Trust)
  // - CF_ACCESS_TEAM      (e.g. "prometheus" — used to build jwks URL)
}
```

A `develop` env follows the same pattern bound to `dev-lists.comprom.org` (mirrors the admin `develop` env).

### 9.3 CF Access provisioning (one-time)

1. **Create Zero Trust team** `prometheus` (free tier — under 50 users). Login methods: GitHub OAuth + email OTP.
2. **Create Application** "comms-admin": hostname `lists.comprom.org`, path prefix `/api/*`.
3. **Access policy** "editors": include rule = login-method `GitHub` AND github_login `∈ {undeadliner, igor_ganov, ...}`.
4. **Bypass policy** "public surface": include rule = path-match `/unsubscribe*` OR `/webhooks/resend`. (Access bypass on these so they reach the worker unauthenticated, but worker layer enforces token + signature.)
5. Take note of the Application **Audience tag** → set as `CF_ACCESS_AUD` secret.
6. Cookie domain `comprom.org` so admin-website's existing browser session is reused.

### 9.4 Resend provisioning (one-time)

1. Create Resend account + verify `comprom.org` domain.
2. Add `resend._domainkey` CNAME from §9.1.
3. Create an API key, store as `RESEND_API_KEY` worker secret.
4. Add webhook endpoint `https://lists.comprom.org/webhooks/resend`, events: `email.bounced`, `email.delivery_delayed`, `email.complained`.
5. Copy the webhook secret as `RESEND_WEBHOOK_SECRET`.

## 10. Local dev story

```bash
cd services/comms-worker
bunx wrangler dev --local --persist-to=.wrangler/state
# In another shell:
bunx wrangler d1 execute comms-prod --local --file migrations/0001_initial.sql
bunx wrangler d1 execute comms-prod --local --file migrations/0002_seed.sql
```

`.dev.vars` (gitignored) carries `RESEND_API_KEY=test`, etc. The Resend client checks `if (env.RESEND_API_KEY === 'test') return mockResendOk()`, so dev never hits Resend.

For E2E we run a second wrangler instance with `BYPASS_SCHEDULE=1` and `RESEND_BASE_URL=http://localhost:3001` (a fixture HTTP server in `e2e/fixtures/resend-stub.ts` that records bodies and returns canned 200s/500s).

## 11. Error / retry matrix

| Failure | Effect | Retry semantics |
|---|---|---|
| D1 transient error in admin write | 500 to UI | UI surfaces toast; editor retries manually |
| RSS fetch 404 / 5xx | log warn, skip that lang's items | next tick re-tries |
| Resend 4xx (non-rate-limit) | `send_log status='failed', error` | NOT retried — bad input, editor reads run-history |
| Resend 429 | sleep `Retry-After`, retry once | if still 429 → mark `failed`, retried at next tick |
| Resend 5xx | retry once with exp. backoff | then `failed`, next tick re-tries |
| CF Workers wall-clock approaches limit | break out of loop, leave un-processed subs untouched | next tick continues (last_sent_at gates) |
| Webhook signature invalid | 401, no mutation | Resend retries per their schedule |

## 12. Observability

Structured logs from the worker (JSON, one line per event):

```
{"evt":"tick.start","tick_at":"2026-06-06T09:00:00Z"}
{"evt":"tick.match","schedule":"0 12 * * 6","timezone":"Europe/Moscow","matched":true}
{"evt":"rss.fetch","lang":"ru","items":24,"ms":312}
{"evt":"dispatch.send","subscriber_id":42,"articles":3,"resend_id":"…","ms":418}
{"evt":"dispatch.skip","subscriber_id":43,"reason":"empty_delta"}
{"evt":"tick.done","sent":5,"failed":0,"skipped":12,"ms":4231}
```

These flow into Workers Logs by default; the Phase B `log-collector` is **not** wired for v1 (we already have a working Worker Logs pipeline; adding another hop is a separate concern).

## 13. Threat model

| Threat | Mitigation |
|---|---|
| Subscriber-enumeration via unsubscribe URL | Token is HMAC; raw ids never appear in URL. 404 on bad token without echo. |
| Forged unsubscribe (one-click replay) | Idempotent — already-unsubscribed row returns 200 with no change; nothing exploitable in replay. |
| Resend webhook forgery | svix signature verification (R3.12). |
| Admin endpoint hit from non-admin | CF Access policy + worker re-verifies JWT signature and `aud` claim (R6.1). |
| `RESEND_API_KEY` leak | Wrangler secret; rotated via `wrangler secret put`; never in source. |
| Token leak in Logpush | `t=` query parameter scrubbed by the structured logger at the boundary. |
| Subscriber emails leaked in run-history page | Behind CF Access; UI never exposes emails to anyone but the editor. |
| Cross-account D1 reuse from develop env | Separate `database_id` per env in `wrangler.jsonc`. |

## 14. What this design does NOT do

- No double-opt-in confirmation email at add-time (`requirements.md` §6.7 — single-opt-in policy).
- No per-subscriber digest templates.
- No web-based "re-subscribe" flow (the confirmation page links to `mailto:public@comprom.org`).
- No HTML email theming dark mode for now (text + readable HTML, no clever CSS).
- No multiple admins UI (CF Access policy uses a static GitHub-login allowlist).

---

**Review checkpoint.** Read §1–§13, push back on anything that diverges from how you want the system to behave, and resolve the three call-out decisions below. After this signs off I'll write `tasks.md` (ordered punch-list with one-task-per-test mapping) and pause again.

### Decisions waiting on you

1. **Free Resend tier limit (100/day) — OK?** If we expect >100 subscribers in the first months we should upgrade to the Pro tier upfront (~$20/mo).
2. **CF Access team name** — `prometheus` proposed. Alternative: `comprom`.
3. **GitHub-login allowlist for CF Access** — confirm the initial list: `undeadliner` only, or others too?
