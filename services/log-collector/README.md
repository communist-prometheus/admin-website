# log-collector

Hono-on-Cloudflare-Workers service that accepts batched OpenTelemetry-shaped traces and logs from the admin client and persists them.

Phase B / Epic 6 host package. Increment 6.1 (scaffold + healthcheck) lands in #125; auth / OTLP / rate-limit follow in 6.2 / 6.3 / 6.4.

## Endpoints

- `GET /health` — liveness probe; returns `{ status: 'ok', version, at }`.

Auth + ingest endpoints land with 6.2+.

## Deploy

Deploys via `.github/workflows/deploy-log-collector.yml` on push to `master`. Locally:

```
cd services/log-collector
npx wrangler deploy
```

Bindings declared in `wrangler.jsonc` are optional until later increments wire them.
