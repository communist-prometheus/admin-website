# comms-worker

Newsletter dispatch service for `comprom.org`. Hono on Cloudflare
Workers, backed by D1 for subscriber state and Resend for SMTP. See
[`../../specs/comms-newsletter/`](../../specs/comms-newsletter/) for
the full spec (requirements + design + tasks).

Ticket: [tickets#23](https://github.com/communist-prometheus/tickets/issues/23).

## Endpoints

| Method | Path                  | Auth            | Purpose |
|--------|-----------------------|-----------------|---------|
| GET    | `/health`             | none            | Liveness probe (Stage 0) |
| GET    | `/api/subscribers`    | SSO cookie      | List (Stage 1) |
| POST   | `/api/subscribers`    | SSO cookie      | Add (Stage 1) |
| PATCH  | `/api/subscribers/:id`| SSO cookie      | Edit langs (Stage 1) |
| DELETE | `/api/subscribers/:id`| SSO cookie      | Remove (Stage 1) |
| GET    | `/api/schedule`       | SSO cookie      | Read cron pattern (Stage 2) |
| PUT    | `/api/schedule`       | SSO cookie      | Save cron pattern (Stage 2) |
| GET    | `/api/runs`           | SSO cookie      | Recent send_log rows (Stage 6) |
| POST   | `/api/dispatch?force=1` | SSO cookie    | Trigger a tick (dev/e2e only) |
| GET    | `/unsubscribe?t=…`    | token           | Confirmation page (Stage 4) |
| POST   | `/unsubscribe?t=…`    | token           | RFC 8058 one-click (Stage 4) |
| POST   | `/webhooks/resend`    | svix sig        | Bounce / complaint events (Stage 5) |

`SSO cookie` = `comprom_session` HttpOnly cookie issued by `auth.comprom.org`,
verified via the same `JWT_SECRET` shared between the two workers. See
[`docs/architecture/sso.md`](../../docs/architecture/sso.md) for the full
flow and rationale (this replaces the original CF Access setup).

Scheduled trigger: `0 * * * *` (UTC heartbeat). The worker reads the
saved `settings.schedule` and decides per-tick whether to dispatch
(spec design §5).

## One-time provisioning

### GitHub org owners — source of truth for "who can edit comms"

The `auth-worker` SSO check accepts only **org owners** of
`communist-prometheus` (GitHub UI label; in the API it's
`role: "admin"` on the org membership endpoint). Adding or removing
a person is a GitHub-org-page operation — no worker config touch.

```bash
# Verify the current owners list.
gh api 'orgs/communist-prometheus/members?role=admin' --jq '.[].login'

# Promote someone (requires existing-owner perms on the org).
gh api 'orgs/communist-prometheus/memberships/<login>' -X PUT \
  -f role=admin
```

### SSO (`auth.comprom.org`)

See [`docs/architecture/sso.md`](../../docs/architecture/sso.md). The
short version: `auth-worker` mints an HttpOnly cookie scoped to
`.comprom.org`; this worker reads it via `requireSession` middleware
on `/api/*`. Both workers share the same `JWT_SECRET`.

There is no Zero Trust / CF Access setup any more — the apps were
deleted in the SSO migration commit.

### Resend account

1. Resend → add domain `comprom.org`, verify (DKIM CNAME + SPF check).
2. Create an API key → store as `RESEND_API_KEY` worker secret.
3. Webhook endpoint: `https://lists.comprom.org/webhooks/resend`.
   Subscribe to events `email.bounced`, `email.delivery_delayed`,
   `email.complained`. Copy the signing secret → store as
   `RESEND_WEBHOOK_SECRET`.

### D1 database

```bash
# Create the prod DB once.
bunx wrangler d1 create comms-prod
# Copy the printed `database_id` into wrangler.jsonc under
# d1_databases[0].database_id. Then apply migrations:
bunx wrangler d1 execute comms-prod \
  --file services/comms-worker/migrations/0001_initial.sql
bunx wrangler d1 execute comms-prod \
  --file services/comms-worker/migrations/0002_seed.sql
```

For local dev, append `--local` to the same commands.

## Secrets

Set via `bunx wrangler secret put <name>` from this directory:

| Secret                  | Purpose |
|-------------------------|---------|
| `JWT_SECRET`            | HS256 SSO secret — MUST match auth-worker |
| `RESEND_API_KEY`        | Resend transactional API auth |
| `RESEND_WEBHOOK_SECRET` | Verify svix signatures on inbound Resend events |
| `UNSUBSCRIBE_SECRET`    | HMAC secret for unsubscribe tokens (32 random bytes) |

## Local dev

```bash
cd services/comms-worker
bunx wrangler dev --local --persist-to=.wrangler/state
```

Copy the template:

```bash
cp .dev.vars.example .dev.vars
```

`.dev.vars` is gitignored (see root `.gitignore` `**/.dev.vars`).
The template carries safe placeholder values; setting
`BYPASS_SCHEDULE=1` exposes `POST /api/dispatch?force=1` for the
E2E happy-path flow. Leave it UNSET in production.

When `RESEND_API_KEY=test`, the Resend client short-circuits to a
stub so dev never hits the real API (spec design §10).

## Deploy

```bash
cd services/comms-worker
bunx wrangler deploy                     # prod
bunx wrangler deploy --env develop       # develop
```

CI workflow: `.github/workflows/deploy-comms-worker.yml` (Stage 7).
