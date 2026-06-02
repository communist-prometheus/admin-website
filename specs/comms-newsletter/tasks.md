# Newsletter — Tasks

> **Status:** DRAFT — phase 3 of three (requirements → design → **tasks**).
> **Source:** [`requirements.md`](./requirements.md), [`design.md`](./design.md).
>
> _Pause for review before implementation begins._

## Reading guide

Tasks are grouped into stages. Each stage is an end-to-end vertical slice — the working tree should be green between stages so we can ship early increments behind a feature flag.

Every task carries:
- A **goal** — what behaviour the task delivers.
- **Touches** — file paths created or edited.
- **EARS** — the requirements criteria it satisfies (from `requirements.md`).
- **Tests** — the test files / cases written FIRST (TDD), and the layer (unit / integration / e2e). The implementation is done when **all** named tests pass.

A task that references multiple EARS lines doesn't necessarily satisfy each fully on its own — the criteria list is the cumulative subset the task moves towards. The final "spec coverage" task (S6.1) cross-checks no criteria are orphaned.

## Stage 0 — Workspace scaffolding

### T0.1 — Add `services/comms-worker` package
- **Goal**: monorepo recognises the new worker, `bun install` picks up its deps.
- **Touches**: `services/comms-worker/package.json`, `tsconfig.json`, `wrangler.jsonc` (skeleton), root `package.json` workspaces glob if needed.
- **EARS**: — (infra-only)
- **Tests**: `services/comms-worker/src/health.test.ts` — GET /health returns `{status:'ok'}` (mirrors log-collector). Layer: integration (`unstable_dev`).

### T0.2 — D1 binding + migrations runner
- **Goal**: empty D1 reachable in `wrangler dev --local`, migration files apply cleanly.
- **Touches**: `migrations/0001_initial.sql`, `migrations/0002_seed.sql`, `scripts/db-migrate.ts` helper.
- **EARS**: §2.1 (schema)
- **Tests**: `src/db/migrations.test.ts` — after running 0001 + 0002 against an in-memory D1, `subscribers`, `settings`, `send_log` tables exist with the documented columns AND `settings.schedule` row is `{cron:"0 12 * * 6",timezone:"Europe/Moscow"}`. Layer: integration.

### T0.3 — GitHub team `communist-prometheus/admins` + initial seeding (manual op)
- **Goal**: CF Access has a stable allowlist target.
- **Touches**: documented in `services/comms-worker/README.md` ops section; the action is shell, not code.
- **EARS**: §15 decisions log, §9.3 step 0
- **Tests**: ops-check only — `gh api orgs/communist-prometheus/teams/admins/members --jq '.[].login'` returns the expected 2 logins.

## Stage 1 — Auth + admin CRUD over subscribers

### T1.1 — CF Access JWT verifier
- **Goal**: pure helper that verifies an Access JWT against the team's JWKS, validates `aud` and `iss`, returns the claim set or throws.
- **Touches**: `src/auth/cf-access.ts`, `src/auth/jwks-cache.ts`.
- **EARS**: R6.1
- **Tests**: `src/auth/cf-access.test.ts` — round-trip with a fixture-signed token (test-only RSA keypair), tamper byte → reject, wrong `aud` → reject, expired `exp` → reject, JWKS cache TTL respected via mocked clock. Layer: unit.

### T1.2 — Hono middleware: `requireAccess`
- **Goal**: wraps `cf-access.ts`; attaches `c.var.access = claims` on success.
- **Touches**: `src/middleware/require-access.ts`.
- **EARS**: R6.1
- **Tests**: `src/middleware/require-access.test.ts` — missing header → 401, bad sig → 401, good token → handler reached. Layer: integration via `unstable_dev`.

### T1.3 — Subscriber repo
- **Goal**: D1 CRUD operations: `insert`, `listActive`, `listAll`, `findById`, `updateLangs`, `delete`, `setStatus`.
- **Touches**: `src/subscribers/repo.ts`, `src/subscribers/types.ts`.
- **EARS**: R1.2, R1.4, R1.5, R1.6, R3.1, R4.4, R4.6
- **Tests**: `src/subscribers/repo.test.ts` — each method has happy + edge cases; insert with existing-active email throws `DuplicateError`; soft-delete vs hard-delete semantics asserted; status transitions covered. Layer: integration (real D1 local).

### T1.4 — Subscriber routes
- **Goal**: HTTP handlers using `requireAccess` + repo.
- **Touches**: `src/subscribers/routes.ts`, mount in `src/index.ts`.
- **EARS**: R1.1, R1.2, R1.3, R1.4, R1.5, R1.6
- **Tests**: `src/subscribers/routes.test.ts` — table-driven over each endpoint × {valid, invalid-body, unauthorised, conflict, not-found}. Layer: integration.

### T1.5 — Admin SPA: store + API client
- **Goal**: Pinia store + typed client; loads via `swFetch`-shaped path, sends `gh_token` header, lets browser send CF Access cookie automatically (same parent domain).
- **Touches**: `admin-website/src/stores/comms.ts`, `admin-website/src/composables/useComms/`.
- **EARS**: R1.1
- **Tests**: `src/stores/comms.test.ts` — mocks `fetch`, asserts URL + headers + body shape match worker contract. Layer: unit.

### T1.6 — Admin SPA: `/comms` view
- **Goal**: route, page chrome, render of subscribers table. No edits yet — read-only first.
- **Touches**: `admin-website/src/router/index.ts`, `admin-website/src/views/CommsView.vue`, `admin-website/src/components/CommsSubscribers/SubscribersTable.vue`.
- **EARS**: R1.1, R1.7
- **Tests**: e2e `e2e/comms/list.spec.ts` — visit `/comms`, expect rows from worker, see `unsubscribed` badge on a seeded inactive row. Layer: e2e.

### T1.7 — Admin SPA: add / edit / remove
- **Goal**: full CRUD interactivity wired to the store; validation errors surfaced inline.
- **Touches**: `AddSubscriberForm.vue`, inline lang toggle in `SubscribersTable.vue`, draft-ops helper.
- **EARS**: R1.2, R1.3, R1.4, R1.5, R1.6
- **Tests**: `e2e/comms/crud.spec.ts` — add valid, add invalid (422 surfaced), toggle lang, remove. Layer: e2e. Plus unit `CommsSubscribers/draft-ops.test.ts` (pure transformations).

## Stage 2 — Schedule editor

### T2.1 — Cron matcher
- **Goal**: pure function `matchesTick(schedule, tickAt) -> boolean` using `cron-parser` with timezone support and a 5-min window.
- **Touches**: `src/cron/matcher.ts`.
- **EARS**: R2.2, R2.5
- **Tests**: `src/cron/matcher.test.ts` — happy match on canonical Saturday-noon-MSK, no-match on Friday, DST flip Saturday (Europe/Moscow has no DST but Europe/Berlin row asserts cron-parser TZ behaviour), missed-by-2-min within window, missed-by-6-min outside window. Layer: unit.

### T2.2 — Settings repo
- **Goal**: read / write `settings.schedule`, atomic with `nextRunAt` computation.
- **Touches**: `src/settings/repo.ts`.
- **EARS**: R2.4
- **Tests**: `src/settings/repo.test.ts` — `set + get` round-trip, `nextRunAt` matches `cron-parser` independently. Layer: integration.

### T2.3 — Schedule routes
- **Goal**: `GET /api/schedule` + `PUT /api/schedule`.
- **Touches**: `src/schedule/routes.ts`.
- **EARS**: R2.1, R2.2, R2.4
- **Tests**: `src/schedule/routes.test.ts` — bad cron → 422 with parser msg, good → 200 + `nextRunAt`. Layer: integration.

### T2.4 — Admin SPA: schedule editor view
- **Goal**: cron input, IANA TZ select, live preview ("every Saturday at 12:00 Europe/Moscow"), next-run timestamp.
- **Touches**: `admin-website/src/components/CommsSubscribers/ScheduleEditor.vue` + helper to humanise crontab.
- **EARS**: R2.1, R2.2, R2.4
- **Tests**: `e2e/comms/schedule.spec.ts` — bad cron inline error, save → preview updates. Plus unit `ScheduleEditor/humanise.test.ts`. Layer: e2e + unit.

## Stage 3 — Dispatch loop (RSS → Resend)

### T3.1 — RSS fetcher + parser
- **Goal**: `fetchRss(lang) -> Article[]`, tolerant of BOM and missing optional fields, supports `pubDate` either RFC 822 or ISO-8601.
- **Touches**: `src/rss/fetch.ts`, `src/rss/parse.ts`.
- **EARS**: R3.2
- **Tests**: `src/rss/parse.test.ts` — fixture XML in `test-fixtures/rss/{ru,en,it}.xml` → expected article arrays. Edge cases: missing description, weird CDATA, BOM. Layer: unit.

### T3.2 — Delta calculator
- **Goal**: `computeDelta(subscriber, articlesByLang) -> Article[]`, sorted newest-first, language-merged per R3.8.
- **Touches**: `src/delta/calculator.ts`.
- **EARS**: R3.1, R3.3, R3.8
- **Tests**: `src/delta/calculator.test.ts` — subscriber `langs=['ru','en']` and `last_sent_at=X`: only items with `pubDate > X` and `lang ∈ langs` returned; empty delta when no item is new; ordering. Layer: unit.

### T3.3 — Digest renderer
- **Goal**: HTML + text bodies; UTM stamping; unsubscribe link insertion; List-Unsubscribe header values.
- **Touches**: `src/digest/render.ts`, `src/digest/i18n.ts` (chrome strings × 7 langs), `src/digest/escape.ts`.
- **EARS**: R3.4, R3.7, R3.8, R4.1
- **Tests**: `src/digest/render.test.ts` — given fixed `(subscriber, delta, unsubscribeUrl)`, snapshot the rendered HTML / text and assert UTM + List-Unsubscribe values exactly. Snapshots committed. Layer: unit.

### T3.4 — Unsubscribe token sign + verify
- **Goal**: `sign(id, secret) -> token`, `verify(token, secret) -> {id} | null`.
- **Touches**: `src/unsubscribe/token.ts`.
- **EARS**: R4.5
- **Tests**: `src/unsubscribe/token.test.ts` — round-trip, tamper rejects, wrong-secret rejects, constant-time compare. Layer: unit.

### T3.5 — Resend client
- **Goal**: thin `sendEmail({from, to, subject, html, text, headers, idempotencyKey}) -> {id} | {error}`. Pattern lifted from `pyaeats-app/.../notify.ts`.
- **Touches**: `src/resend/client.ts`.
- **EARS**: R3.4, R3.5, R3.6, R3.9, R6.4
- **Tests**: `src/resend/client.test.ts` — `fetch` mocked, asserts URL + headers + body; 2xx → returns `id`; 4xx → returns `error`; 429 → backoff once then `error`; 5xx → backoff once then `error`. Layer: unit.

### T3.6 — Send log repo
- **Goal**: `append(row)`, `listRecent(limit)`, `purgeOlderThan(days)`.
- **Touches**: `src/send-log/repo.ts`.
- **EARS**: R3.5, R3.6, R5.1, R5.4
- **Tests**: `src/send-log/repo.test.ts` — `append + list` round-trip, retention sweep deletes only old rows. Layer: integration.

### T3.7 — Dispatch orchestrator
- **Goal**: pure function `runDispatch({db, rss, resend, secret, tickAt})` that ties §3.2 of design.md together. **No D1 / HTTP / cron** in the function itself — dependencies injected for testability.
- **Touches**: `src/dispatch/run.ts`.
- **EARS**: R3.1, R3.3, R3.4, R3.5, R3.6, R3.7, R3.8, R3.9, R5.4, R6.4
- **Tests**: `src/dispatch/run.test.ts` — table-driven scenarios:
  - 0 subs → no-op, no Resend call
  - 1 sub, empty delta → no Resend call, `last_sent_at` untouched
  - 1 sub, 3 new → Resend called once with expected body, `last_sent_at` advanced
  - 2 subs sharing lang → 1 RSS fetch (caching honoured), 2 Resend calls
  - Resend 5xx → `send_log status='failed'`, `last_sent_at` untouched
  - Idempotency key matches `<id>:<tickAt>`
  Layer: integration (with mocks for RSS + Resend).

### T3.8 — Scheduled handler
- **Goal**: CF Workers `scheduled` entry: load schedule, match tick, call `runDispatch`, structured log.
- **Touches**: `src/index.ts` (extend with `scheduled(event, env, ctx)`).
- **EARS**: R2.5, R3.1–R3.9
- **Tests**: `src/scheduled.test.ts` — using `unstable_dev` with a fixed `Date.now`, fire one scheduled event, assert dispatch ran exactly when matcher said so. Layer: integration.

### T3.9 — `POST /api/dispatch?force=1` test-only endpoint
- **Goal**: lets E2E manually trigger a tick without waiting for cron.
- **Touches**: `src/dispatch/force-route.ts`.
- **EARS**: §4.3 (design)
- **Tests**: covered by T5.2 e2e.

## Stage 4 — Public unsubscribe surface

### T4.1 — Unsubscribe handler (GET + POST)
- **Goal**: verify token, flip status, render confirmation page on GET, 200-empty on POST.
- **Touches**: `src/unsubscribe/routes.ts`, `src/unsubscribe/confirmation.html.ts` (small template per supported lang).
- **EARS**: R4.2, R4.3, R4.4, R4.5
- **Tests**: `src/unsubscribe/routes.test.ts` — table over `{GET valid, POST valid, tampered → 404, missing token → 404, already-unsubscribed → 200 idempotent}`. Acceptance includes the rendered page's `Accept-Language` fallback. Layer: integration.

### T4.2 — Wire unsubscribe URL into the digest
- **Goal**: `runDispatch` now passes the per-subscriber URL into `render`. Already wired in T3.3 + T3.7 inputs; this task verifies end-to-end.
- **Touches**: `src/dispatch/run.ts` (final wiring), no new file.
- **EARS**: R4.1, R4.6
- **Tests**: integration test in T3.7 already includes assertions; this task is the explicit "does the link in the rendered email body, when followed in T5.2 e2e, actually work?" check.

## Stage 5 — Resend webhook

### T5.1 — Webhook signature verifier (svix-style)
- **Goal**: HMAC verify `svix-id` + `svix-timestamp` + body against `RESEND_WEBHOOK_SECRET`, reject if timestamp > 5 min old.
- **Touches**: `src/webhooks/verify.ts`.
- **EARS**: R3.10, R3.12
- **Tests**: `src/webhooks/verify.test.ts` — valid → ok, tampered → reject, old timestamp → reject. Layer: unit.

### T5.2 — Webhook route
- **Goal**: `POST /webhooks/resend` flips subscriber status based on event type.
- **Touches**: `src/webhooks/routes.ts`.
- **EARS**: R3.10, R3.11, R3.12, R4.7
- **Tests**: `src/webhooks/routes.test.ts` — `email.bounced` → status `bounced` + send_log row, `email.complained` → `complained`, bad sig → 401 + no mutation. Layer: integration.

### T5.3 — Subsequent dispatches skip bounced/complained
- **Goal**: enrich subscriber repo `listActive` to filter `status='active'` ONLY, no longer including `bounced`/`complained`.
- **Touches**: `src/subscribers/repo.ts` (already filters via R3.1, but explicit T to nail the test).
- **EARS**: R4.6, R4.7
- **Tests**: extend `src/dispatch/run.test.ts` with a `bounced` subscriber → skipped, no Resend call. Layer: integration.

## Stage 6 — Run history view + retention

### T6.1 — `GET /api/runs`
- **Goal**: returns last `limit` send_log rows joined to subscriber email (with PII boundary — admin only).
- **Touches**: `src/send-log/routes.ts`.
- **EARS**: R5.1
- **Tests**: `src/send-log/routes.test.ts` — limits, default 20, ordering DESC by tick_at. Layer: integration.

### T6.2 — Admin SPA: RunHistory view
- **Goal**: list of 20 most-recent rows, `data-testid="send-log-failed"` highlight on failures, click → reveal full error.
- **Touches**: `admin-website/src/components/CommsSubscribers/RunHistory.vue`.
- **EARS**: R5.1, R5.2, R5.3
- **Tests**: e2e `e2e/comms/run-history.spec.ts` — visit /comms → see rows; trigger force-dispatch → new row visible after reload. Layer: e2e.

## Stage 7 — Cross-cutting + ship

### T7.1 — Structured logger boundary
- **Goal**: tiny wrapper that emits the JSON shape from design §12, redacting `t=` query parameter and email PII per R6.5.
- **Touches**: `src/log/structured.ts`.
- **EARS**: R6.3, R6.5
- **Tests**: `src/log/structured.test.ts` — given `evt + payload`, console output is canonicalised JSON and `t=...` truncated. Layer: unit.

### T7.2 — Wrangler dev env + secrets template
- **Goal**: `.dev.vars.example`, README ops section, scripts to run migrations + start dev.
- **Touches**: `services/comms-worker/.dev.vars.example`, `services/comms-worker/README.md`.
- **EARS**: R6.2
- **Tests**: ops-check; CI lint asserts `.dev.vars` is gitignored.

### T7.3 — CI: deploy workflow
- **Goal**: `.github/workflows/deploy-comms-worker.yml`, mirror of log-collector pipeline; runs migrations on prod D1 then `wrangler deploy`.
- **Touches**: workflow file, secrets pulled from existing repo settings.
- **EARS**: §9.2 (infra)
- **Tests**: dry-run workflow on PR — green build.

### T7.4 — End-to-end Playwright suite that covers the entire user journey
- **Goal**: a single `e2e/comms/full-flow.spec.ts` walking the happy path:
  1. login as admin
  2. add subscriber `e2e-bot@example.test` with langs `['ru','en']`
  3. set schedule to `* * * * *` (every minute) in `Etc/UTC` for the test
  4. trigger `POST /api/dispatch?force=1`
  5. assert Resend-stub received 1 payload with both languages merged
  6. extract unsubscribe URL from the captured payload
  7. POST it → 200
  8. trigger force-dispatch again → Resend-stub received 0 new payloads
  9. visit /comms → row shows `unsubscribed at <date>` badge
  - assert all run-history rows present
- **EARS**: ALL — the integration test of record.
- **Tests**: this file IS the test.

### T7.5 — Spec coverage audit
- **Goal**: a tiny script `scripts/spec-coverage.ts` that scans `requirements.md` for `R\d+\.\d+` ids and `tasks.md` + test names for the same; reports any orphan.
- **Touches**: `scripts/spec-coverage.ts`, optionally CI step.
- **EARS**: traceability promise from §5 of requirements.
- **Tests**: `scripts/spec-coverage.test.ts` — fixture-based assertion. Layer: unit.

## Per-task convention

- All worker code is TS with `"strict": true`; no `any`; `import type` for type-only imports; arrow + closure styles per `CLAUDE.md`.
- All TS files keep to **50 non-blank lines** + 25-per-function per oxlint config from MEMORY.md.
- Exported helpers carry JSDoc with `@param` / `@returns`.
- Tests live next to the file (e.g. `src/cron/matcher.ts` ↔ `src/cron/matcher.test.ts`).
- Each PR scoped to **one stage**; we don't ship Stage 3 without Stage 2 green.

## Traceability table (sample — full one regenerated by T7.5)

| EARS | Tasks | Tests |
|---|---|---|
| R1.2 | T1.3, T1.4, T1.7 | `repo.test.ts`, `routes.test.ts`, e2e/crud |
| R2.5 | T2.1, T3.8 | `matcher.test.ts`, `scheduled.test.ts`, e2e/full-flow |
| R3.1 | T3.2, T3.7 | `calculator.test.ts`, `run.test.ts` |
| R3.4 | T3.3, T3.5, T3.7 | `render.test.ts`, `client.test.ts`, `run.test.ts` |
| R4.3 | T4.1 | `routes.test.ts` (POST one-click) |
| R4.5 | T3.4, T4.1 | `token.test.ts`, `routes.test.ts` |
| R5.4 | T3.6, T3.7 | `send-log/repo.test.ts`, `run.test.ts` |
| R6.1 | T1.1, T1.2 | `cf-access.test.ts`, `require-access.test.ts` |
| R6.5 | T7.1 | `structured.test.ts` |

## Estimate

| Stage | Tasks | Wall-clock |
|---|---|---|
| 0 — scaffolding | 3 | half day |
| 1 — auth + CRUD | 7 | 2 days |
| 2 — schedule | 4 | 1 day |
| 3 — dispatch | 9 | 3 days |
| 4 — unsubscribe | 2 | half day |
| 5 — webhook | 3 | 1 day |
| 6 — history | 2 | half day |
| 7 — ship | 5 | 1 day |
| **total** | **35** | **≈9 working days** |

---

**Review checkpoint.** Read the stage list + per-task scope. After this is signed off the implementation PRs land one stage at a time on top of this branch (each its own PR for reviewability).
