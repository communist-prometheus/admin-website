# comms-worker

Newsletter dispatch service for `comprom.org`. Hono on Cloudflare
Workers, backed by D1 for subscriber state and Resend for SMTP. See
[`../../specs/comms-newsletter/`](../../specs/comms-newsletter/) for
the full spec (requirements + design + tasks).

Ticket: [tickets#23](https://github.com/communist-prometheus/tickets/issues/23).

## Endpoints

| Method | Path                  | Auth        | Purpose |
|--------|-----------------------|-------------|---------|
| GET    | `/health`             | none        | Liveness probe (Stage 0) |
| GET    | `/api/subscribers`    | CF Access   | List (Stage 1) |
| POST   | `/api/subscribers`    | CF Access   | Add (Stage 1) |
| PATCH  | `/api/subscribers/:id`| CF Access   | Edit langs (Stage 1) |
| DELETE | `/api/subscribers/:id`| CF Access   | Remove (Stage 1) |
| GET    | `/api/schedule`       | CF Access   | Read cron pattern (Stage 2) |
| PUT    | `/api/schedule`       | CF Access   | Save cron pattern (Stage 2) |
| GET    | `/api/runs`           | CF Access   | Recent send_log rows (Stage 6) |
| POST   | `/api/dispatch?force=1` | CF Access | Trigger a tick (dev/e2e only) |
| GET    | `/unsubscribe?t=…`    | token       | Confirmation page (Stage 4) |
| POST   | `/unsubscribe?t=…`    | token       | RFC 8058 one-click (Stage 4) |
| POST   | `/webhooks/resend`    | svix sig    | Bounce / complaint events (Stage 5) |

Scheduled trigger: `0 * * * *` (UTC heartbeat). The worker reads the
saved `settings.schedule` and decides per-tick whether to dispatch
(spec design §5).

## One-time provisioning

### GitHub team for CF Access

CF Access matches against a GitHub team — adding / removing admins in
future is a single `gh` call, not a CF policy edit.

```bash
# Create the team (private/closed visibility).
gh api orgs/communist-prometheus/teams \
  -X POST -f name=admins \
  -f description='CF Access policy target for sensitive admin surfaces' \
  -f privacy=closed

# Seed with current org owners (gh api orgs/communist-prometheus/members?role=admin).
gh api orgs/communist-prometheus/teams/admins/memberships/Pyper6 \
  -X PUT -f role=member
gh api orgs/communist-prometheus/teams/admins/memberships/undeadliner \
  -X PUT -f role=member

# Verify.
gh api orgs/communist-prometheus/teams/admins/members --jq '.[].login'
```

### CF Access application

1. Cloudflare Zero Trust → Settings → create team `comprom` (→ `comprom.cloudflareaccess.com`).
2. Authentication → connect GitHub OAuth app, scope `read:org`.
3. Access → Applications → Add a self-hosted application:
   - Name: `comms-admin`
   - Hostname: `lists.comprom.org`
   - Path: `/api/*`
4. Policy "editors":
   - Action: Allow
   - Include: Login method = GitHub **AND** GitHub team
     `communist-prometheus/admins`
5. Bypass policy "public surface":
   - Action: Bypass
   - Include: URL contains `/unsubscribe` OR `/webhooks/`
6. Capture the application **Audience tag** → set as the
   `CF_ACCESS_AUD` worker secret.
7. Cookie domain: `comprom.org` (parent so admin.comprom.org's
   existing browser session is reused).

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
| `RESEND_API_KEY`        | Resend transactional API auth |
| `RESEND_WEBHOOK_SECRET` | Verify svix signatures on inbound Resend events |
| `UNSUBSCRIBE_SECRET`    | HMAC secret for unsubscribe tokens (32 random bytes) |
| `CF_ACCESS_AUD`         | CF Access Application Audience tag |
| `CF_ACCESS_TEAM`        | CF Access team slug = `comprom` |

## Local dev

```bash
cd services/comms-worker
bunx wrangler dev --local --persist-to=.wrangler/state
```

Create `services/comms-worker/.dev.vars` (gitignored) with:

```
RESEND_API_KEY=test
RESEND_WEBHOOK_SECRET=test
UNSUBSCRIBE_SECRET=local-dev-secret-32-bytes-padding
CF_ACCESS_AUD=local
CF_ACCESS_TEAM=local
```

When `RESEND_API_KEY=test`, the Resend client short-circuits to a
stub so dev never hits the real API (spec design §10).

## Deploy

```bash
cd services/comms-worker
bunx wrangler deploy                     # prod
bunx wrangler deploy --env develop       # develop
```

CI workflow: `.github/workflows/deploy-comms-worker.yml` (Stage 7).
