# Newsletter — Requirements

> **Status:** DRAFT — phase 1 of three (requirements → design → tasks).
> **Ticket:** [communist-prometheus/tickets#23](https://github.com/communist-prometheus/tickets/issues/23)
>
> _Pause for review at the end of this file before moving to design.md._

## 1. Overview

Add a **Newsletter** capability to the admin so editors can manage a small list of email subscribers, pick the languages each subscriber wants to receive, and let a Cloudflare Worker mail out a digest of newly-published blog articles on a configurable cron schedule. Recipients can self-unsubscribe via a one-click link in every message; the admin surfaces the resulting status.

The feature spans three deployable units:

1. **services/comms-worker** — Hono + D1 + Resend on a CF Worker (subdomain `lists.comprom.org`). Owns subscriber state, the dispatch loop, and the public unsubscribe endpoint.
2. **admin-website UI** — Vue views for subscriber CRUD, schedule editor, and run-history surface.
3. **DNS + CF Access** — one new subdomain, CF Access policy gating the admin endpoints, Resend DNS records (SPF align / DKIM second key on a subdomain), and storage migration.

Out of scope for this spec: arbitrary HTML email templates beyond a fixed digest layout, double-opt-in email confirmation flow (single-opt-in adopted — editors invite people they already trust), per-article personalisation, A/B subject testing.

## 2. Glossary

| Term | Meaning |
|---|---|
| **Subscriber** | One `email + langs[] + status + last_sent_at` row in the comms-worker D1 |
| **Digest** | The email body listing all blog articles published since the subscriber's last successful send, filtered by their `langs` |
| **Schedule** | A 5-field crontab expression + IANA timezone stored once per environment in D1 (key `schedule`) |
| **Heartbeat** | The CF Workers Scheduled Trigger that fires hourly at `0 * * * *` UTC; the worker decides on each tick whether the user-defined schedule says "fire now" |
| **Unsubscribe token** | A 32-byte URL-safe HMAC-SHA256 of `(subscriber_id, last_sent_at)` keyed by `UNSUBSCRIBE_SECRET`, embedded in every dispatched message |
| **CF Access** | Cloudflare Zero Trust SSO; emits `Cf-Access-Jwt-Assertion` header validated by the worker |

## 3. User stories

### 3.1 Editor — manage subscribers

> **As** the editor,
> **I want** to add, edit and remove email recipients with their preferred languages,
> **so that** I control who gets the digest and what mix of content they see.

#### Acceptance criteria (EARS)

- **R1.1** WHEN the editor opens `/comms` in the admin THE SYSTEM SHALL render every subscriber as a row showing `email`, `langs`, `status`, `last_sent_at`, `unsubscribed_at` (when applicable).
- **R1.2** WHEN the editor submits the "add subscriber" form with a syntactically-valid email and at least one supported language THE SYSTEM SHALL persist the row with `status='active'` and respond 201.
- **R1.3** IF the submitted email is syntactically invalid OR no language is selected THEN THE SYSTEM SHALL respond 422 with the failing field name AND the admin UI SHALL show the inline error without losing the typed value.
- **R1.4** IF the submitted email already exists with `status='active'` THEN THE SYSTEM SHALL respond 409 and the UI SHALL surface "already subscribed".
- **R1.5** WHEN the editor toggles a language on an existing row THE SYSTEM SHALL update the row's `langs[]`, leaving `last_sent_at` untouched.
- **R1.6** WHEN the editor presses "Remove" on a row THE SYSTEM SHALL hard-delete the row (history is preserved in `send_log`, see §3.4).
- **R1.7** WHERE a row has `status='unsubscribed'` THE SYSTEM SHALL render a non-interactive `unsubscribed at <date>` badge and hide the language toggle.

### 3.2 Editor — configure schedule

> **As** the editor,
> **I want** to set how often the digest goes out,
> **so that** I match the publication rhythm without redeploying anything.

#### Acceptance criteria (EARS)

- **R2.1** WHEN the editor opens `/comms` THE SYSTEM SHALL render the current schedule as a crontab string + a human-readable preview ("every Saturday at 12:00 Europe/Moscow") + a "next run at <UTC ISO timestamp>".
- **R2.2** WHEN the editor saves a new crontab THE SYSTEM SHALL validate it against a 5-field standard parser; valid → persisted, invalid → 422 with the parser's error message.
- **R2.3** WHEN no schedule has ever been written THE SYSTEM SHALL apply the default `0 12 * * 6` `Europe/Moscow` (Saturdays at noon Moscow).
- **R2.4** WHEN the schedule is saved THE SYSTEM SHALL recompute the next-run timestamp atomically with the write and return it in the response.
- **R2.5** WHILE the schedule is set to `<value>` THE SYSTEM SHALL fire the dispatch loop only on heartbeat ticks whose minute-precision UTC time matches the crontab expanded in the schedule's timezone.

### 3.3 System — deliver the digest

> **As** the system,
> **I want** to compute the per-subscriber delta of new articles and mail it,
> **so that** subscribers get exactly the new content on their chosen languages.

#### Acceptance criteria (EARS)

- **R3.1** WHEN a heartbeat tick matches the active schedule THE SYSTEM SHALL load every `status='active'` subscriber and, for each, compute the delta as: articles whose `pubDate > subscriber.last_sent_at OR last_sent_at IS NULL`, filtered by `lang ∈ subscriber.langs`.
- **R3.2** WHEN computing the delta THE SYSTEM SHALL fetch each requested language's RSS at `https://comprom.org/{lang}/rss.xml` (cached in-memory for the duration of the tick) and parse `<item>` entries.
- **R3.3** WHEN a subscriber's delta is empty THE SYSTEM SHALL NOT send an email and SHALL NOT touch `last_sent_at`.
- **R3.4** WHEN a subscriber's delta is non-empty THE SYSTEM SHALL POST a transactional message to Resend's `/emails` endpoint with `from=public@comprom.org`, `to=<subscriber>`, a subject derived from `"Communist Prometheus — <N> new articles"`, an HTML+text body listing each article (title, language, pub date, link), AND a `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` header pair per RFC 8058.
- **R3.5** WHEN Resend responds 2xx THE SYSTEM SHALL update `subscriber.last_sent_at` to the heartbeat tick's UTC start AND append a `send_log` row `(id, subscriber_id, tick_at, article_count, status='sent', resend_id)`.
- **R3.6** IF Resend responds non-2xx for an individual subscriber THEN THE SYSTEM SHALL append `send_log (status='failed', error)`, leave `last_sent_at` untouched (so the next tick retries the same delta), and continue with the next subscriber.
- **R3.7** WHEN the digest renders a per-article link THE SYSTEM SHALL include a `utm_source=newsletter&utm_medium=email&utm_campaign=<YYYY-WW>` querystring so traffic is attributable in CF analytics.
- **R3.8** WHEN a single subscriber's `langs[]` covers multiple languages THE SYSTEM SHALL merge their deltas into one email, ordered newest-first, with the article's language shown as a small badge next to each title.
- **R3.9** WHILE Resend's `Idempotency-Key` field is supported THE SYSTEM SHALL pass `<subscriber_id>:<tick_at>` as the key so a retried tick never double-sends.

### 3.4 Recipient — self-unsubscribe

> **As** a recipient,
> **I want** to opt out without logging into anything,
> **so that** I stop receiving the digest immediately.

#### Acceptance criteria (EARS)

- **R4.1** WHEN the worker dispatches a message THE SYSTEM SHALL embed an unsubscribe link of the form `https://lists.comprom.org/unsubscribe?t=<token>` AND mirror it in `List-Unsubscribe: <https://...>` + the RFC-8058 one-click header.
- **R4.2** WHEN a recipient opens the URL with `GET` THE SYSTEM SHALL render an HTML confirmation page in the recipient's preferred language (best-effort via `Accept-Language`) showing "You have been unsubscribed" and a "Re-subscribe" CTA emailing `public@comprom.org`.
- **R4.3** WHEN a mail provider POSTs to the URL with `List-Unsubscribe=One-Click` (per RFC 8058) THE SYSTEM SHALL respond 200 with empty body within 30 s.
- **R4.4** WHEN the token validates AND the subscriber exists THE SYSTEM SHALL set `status='unsubscribed'`, `unsubscribed_at=<utc-now>` AND respond 200 (idempotent for already-unsubscribed rows).
- **R4.5** IF the token's HMAC does not validate OR the embedded subscriber id is unknown THEN THE SYSTEM SHALL respond 404 with a generic "link expired" page and SHALL log the failure with `severity=warn` (no PII).
- **R4.6** WHILE a subscriber is `status='unsubscribed'` THE SYSTEM SHALL skip them in §3.3 even if the editor toggles languages.

### 3.5 Editor — observe state

> **As** the editor,
> **I want** to see what the worker did,
> **so that** I can trust delivery and catch problems.

#### Acceptance criteria (EARS)

- **R5.1** WHEN the editor opens `/comms` THE SYSTEM SHALL render the 20 most recent `send_log` entries as a chronological list `(tick_at, subscriber, articles, status, error?)`.
- **R5.2** WHEN the editor reloads after a dispatch tick THE SYSTEM SHALL show the new `send_log` rows AND the updated `last_sent_at` columns within one page load.
- **R5.3** WHEN a row in `send_log` has `status='failed'` THE SYSTEM SHALL render it with a `data-testid="send-log-failed"` flag and reveal the truncated error message under a disclosure.
- **R5.4** WHERE `send_log` is older than 90 days THE SYSTEM SHALL drop those rows on the heartbeat tick (cheap retention, no separate cron).

## 4. Cross-cutting requirements

- **R6.1 — auth.** Every admin endpoint (`/api/subscribers`, `/api/schedule`, `/api/runs`) requires a valid `Cf-Access-Jwt-Assertion` JWT signed by CF Access for the `lists.comprom.org` application; the worker validates the JWT against `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` (cached) and rejects with 401 otherwise. The public unsubscribe routes are explicitly unauthenticated.
- **R6.2 — secrets.** `RESEND_API_KEY`, `UNSUBSCRIBE_SECRET`, `CF_ACCESS_AUD`, `CF_ACCESS_TEAM_DOMAIN` are CF Worker secrets, never in source. Local dev uses `wrangler dev --local` with `.dev.vars`.
- **R6.3 — observability.** Every dispatch tick logs structured JSON to console (`tick_at`, `subscribers_count`, `sent`, `failed`, `duration_ms`). CF Logpush captures it into our existing logging pipeline.
- **R6.4 — rate.** The worker SHALL serialise Resend calls (`await` each one) within a single tick so we never exceed Resend's 10 rps free-tier limit; aggregate count is also bounded by `MAX_SUBSCRIBERS_PER_TICK=100` env (defence in depth).
- **R6.5 — data hygiene.** Subscriber emails are stored lowercased; on read they are returned as-stored. Token + send_log redacted in logs.
- **R6.6 — DNS / deliverability.** SPF + DKIM aligned for `comprom.org` (Zoho selector already present); a `resend._domainkey.comprom.org` CNAME added to chain Resend's DKIM. DMARC remains `p=none` (per current state); we move to `p=quarantine` after two weeks of green reports.
- **R6.7 — single-opt-in.** The editor takes responsibility for adding only consented addresses; the system does NOT send a confirmation email at add-time. The footer of every digest carries an obvious unsubscribe link as compensation.

## 5. Test contour

Every criterion above is **testable**. The contour is layered:

### 5.1 Unit (Vitest, both repos)

| Module | Criteria covered |
|---|---|
| `comms-worker/cron-matcher.ts` | R2.2, R2.5 — crontab parsing + tick matching across timezones (incl. DST flip Sat→Sat) |
| `comms-worker/delta.ts` | R3.1, R3.3, R3.8 — RSS fixture → expected article list for `langs=['ru','en']`, `last_sent_at=X` |
| `comms-worker/rss.ts` | R3.2 — fixture XML → typed item array; tolerates BOM, missing `<description>` |
| `comms-worker/token.ts` | R4.5 — HMAC sign/verify round-trip, rejects tampered token byte-by-byte |
| `comms-worker/digest-render.ts` | R3.4, R3.7, R4.1 — input items + subscriber → final HTML/text bodies with UTM + List-Unsubscribe |
| `admin-website/CommsView/draft-ops.ts` | R1.2, R1.3, R1.5 — local editing ops are pure transformations |

### 5.2 Integration (Vitest + `unstable_dev` worker harness)

| Scenario | Criteria covered |
|---|---|
| `POST /api/subscribers` with valid JWT + valid body → 201 + row in D1 | R1.2, R6.1 |
| Same endpoint without JWT → 401 | R6.1 |
| Same endpoint with duplicate email → 409 | R1.4 |
| `PUT /api/schedule` with bad cron → 422 with parser error | R2.2 |
| Scheduled handler at heartbeat WHEN no subscriber match → 0 Resend calls | R2.5, R3.3 |
| Scheduled handler with one matching subscriber + mock RSS fixture + mock Resend 200 → `last_sent_at` updated, `send_log` row | R3.1, R3.4, R3.5, R3.9 |
| Scheduled handler with Resend mock 500 → `send_log` failed, `last_sent_at` NOT updated | R3.6 |
| `GET /unsubscribe?t=<good>` → 200, row flipped | R4.2, R4.4 |
| `POST /unsubscribe?t=<good>` (RFC 8058 one-click) → 200 | R4.3 |
| `GET /unsubscribe?t=<tampered>` → 404 | R4.5 |
| Re-tick after unsubscribe → that subscriber skipped | R4.6 |
| `send_log` rows older than 90 days deleted on next tick | R5.4 |

### 5.3 E2E (Playwright in admin-website)

| Scenario | Criteria covered |
|---|---|
| Add a subscriber → row visible after reload | R1.1, R1.2 |
| Toggle a language → API call sent, row reflects new state | R1.5 |
| Set bad cron → inline error visible | R2.2 |
| Save valid cron → preview + next-run updates | R2.1, R2.4 |
| Trigger manual dispatch (test-only `POST /api/dispatch?force=1` gated by env flag) → run-history row appears | R5.1, R5.2 |
| Click an unsubscribe-confirmation page hosted on `lists.comprom.org` in test env → status flips in admin within reload | R4.2, R4.4, R3.4 |

All e2e tests run against a wrangler-dev instance of `comms-worker` bound to an in-memory D1 (`wrangler d1 execute --local`) and a stub Resend (toy HTTP server intercepting `https://api.resend.com/emails`).

## 6. Non-functional

- **Performance.** A dispatch tick with 100 active subscribers + average delta of 5 articles SHALL complete within 60 s wall-clock (well under CF Workers' 30 s CPU cap per request — wall-clock is on Resend network).
- **Cost.** Within free tiers: Resend (100/day) covers initial usage; D1 storage trivial.
- **Security.** No subscriber emails returned over the public unsubscribe surface; the confirmation page acknowledges the action without echoing the address. Unsubscribe tokens are single-purpose (cannot be used to subscribe back).
- **Localisation.** The unsubscribe confirmation page renders in `en/ru/it/es/uk/bl/pl` matching the rest of the site, falling back to English on `Accept-Language` miss.
- **Accessibility.** Admin `/comms` follows the existing keyboard-nav + ARIA conventions used by the LinksEditor (see PR #245); confirmation page passes axe core rules.

## 7. Decisions log

All §7 open questions resolved in chat after phase-1 review:

| Decision | Choice | Implication |
|---|---|---|
| Resend webhook | **In v1.** | Adds `POST /webhooks/resend` endpoint; bounce / complaint events flip `subscriber.status` to `bounced` / `complained` and append a `send_log` row. New EARS criteria R3.10–R3.12 below. |
| Subdomain | **`lists.comprom.org`** | DNS CNAME → worker; CF Access policy bound to this hostname only. |
| CF Access team domain | **Provision as part of this work.** | A new Zero Trust team (e.g. `prometheus.cloudflareaccess.com`) is created; provisioning steps belong in `design.md` §infra. |
| Multi-lang digest locale | **First `langs[]` entry for chrome; article titles in their own language.** | Already encoded in R3.8; this confirms it. |

#### Added EARS criteria

- **R3.10** WHEN Resend POSTs a webhook event with `type='email.bounced'` or `'email.delivery_delayed'` (hard category) THE SYSTEM SHALL verify the payload's `svix-id` / `svix-signature` headers against `RESEND_WEBHOOK_SECRET`, set the matching subscriber's `status='bounced'`, and append a `send_log (status='bounced', resend_id)`.
- **R3.11** WHEN Resend POSTs `type='email.complained'` THE SYSTEM SHALL set `status='complained'` and SHALL skip that subscriber in §3.3 going forward.
- **R3.12** IF webhook signature verification fails THEN THE SYSTEM SHALL respond 401 and log `severity=warn` without mutating state.
- **R4.7** WHERE a subscriber is `status ∈ {bounced, complained}` THE SYSTEM SHALL skip them in §3.3 (identical handling to `unsubscribed`).

---

**Review checkpoint cleared 2026-06-02.** Phase 2 (`design.md`) follows.
