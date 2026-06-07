import { Hono } from 'hono'
import type { Bindings, WorkerCtx } from './bindings'
import { mountForceDispatchRoute } from './dispatch/force-route'
import { registerHealthRoute } from './health'
import { cors } from './middleware/cors'
import {
  requireSession,
  type SessionVerifier,
} from './middleware/require-session'
import { mountScheduleRoutes } from './schedule/routes'
import { mountRunsRoute } from './send-log/route'
import { createSettingsRepo } from './settings/repo'
import { createRepo } from './subscribers/repo'
import { mountSubscriberRoutes } from './subscribers/routes'
import { mountUnsubscribeRoutes } from './unsubscribe/routes'
import { mountWebhookRoutes } from './webhooks/routes'

/** Options accepted by {@link createApp} — test seams. */
export type CreateAppOptions = {
  readonly sessionVerifier?: SessionVerifier
}

const nowIso = (): string => new Date().toISOString()
const nowDate = (): Date => new Date()

/**
 * Build the Hono app wired with every comms-worker route. Default
 * wiring is restored when no options are supplied; tests inject a
 * stub session verifier so they don't need a real signing secret.
 * @param opts Optional test seams.
 * @returns Hono app, ready to bind to `fetch`.
 */
export const createApp = (opts: CreateAppOptions = {}): Hono<WorkerCtx> => {
  const app = new Hono<WorkerCtx>()
  app.use('*', cors())
  registerHealthRoute(app)
  app.use(
    '/api/*',
    requireSession({ verifier: opts.sessionVerifier })
  )
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
