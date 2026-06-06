import type { Hono } from 'hono'
import { buildWebhookHandler } from './route-handler'
import type { WebhookEnv } from './runtime-env'

export type { WebhookEnv } from './runtime-env'

type App = Hono<{ Bindings: WebhookEnv }>

/** Options consumed by {@link mountWebhookRoutes}. */
export type MountWebhookOptions = {
  readonly now?: () => number
}

/**
 * Mount `POST /webhooks/resend` — verifies the Svix-style signature
 * with the worker's `RESEND_WEBHOOK_SECRET`, then maps the event to
 * a subscriber status flip + a `send_log` marker row (R3.10–R3.12).
 * @param app Hono app instance (no CF Access middleware on this prefix).
 * @param opts Optional `now` seam for tests.
 * @returns The same app for chaining.
 */
export const mountWebhookRoutes = (
  app: App,
  opts: MountWebhookOptions = {}
): App => {
  app.post('/webhooks/resend', buildWebhookHandler(opts.now ?? Date.now))
  return app
}
