import { Hono } from 'hono'
import type { Bindings, WorkerCtx } from './bindings'
import { mountForceDispatchRoute } from './dispatch/force-route'
import { registerHealthRoute } from './health'
import {
  type AccessVerifier,
  requireAccess,
} from './middleware/require-access'
import { mountScheduleRoutes } from './schedule/routes'
import { mountRunsRoute } from './send-log/route'
import { createSettingsRepo } from './settings/repo'
import { createRepo } from './subscribers/repo'
import { mountSubscriberRoutes } from './subscribers/routes'
import { mountUnsubscribeRoutes } from './unsubscribe/routes'
import { mountWebhookRoutes } from './webhooks/routes'

/** Options accepted by {@link createApp} — test seams + clocks. */
export type CreateAppOptions = {
  readonly accessVerifier?: AccessVerifier
}

const nowIso = (): string => new Date().toISOString()
const nowDate = (): Date => new Date()

/**
 * Build the Hono app wired with every comms-worker route. The default
 * production wiring is restored when no options are supplied; tests
 * inject a stub CF Access verifier.
 * @param opts Optional test seams.
 * @returns Hono app, ready to bind to `fetch` or `app.fetch` directly.
 */
export const createApp = (opts: CreateAppOptions = {}): Hono<WorkerCtx> => {
  const app = new Hono<WorkerCtx>()
  registerHealthRoute(app)
  app.use('/api/*', requireAccess({ verifier: opts.accessVerifier }))
  mountSubscriberRoutes(app, c =>
    createRepo({ db: (c.env as Bindings).DB, now: nowIso })
  )
  mountScheduleRoutes(
    app,
    c => createSettingsRepo({ db: (c.env as Bindings).DB }),
    nowDate
  )
  mountForceDispatchRoute(app)
  mountRunsRoute(app)
  mountUnsubscribeRoutes(app)
  mountWebhookRoutes(app)
  return app
}
