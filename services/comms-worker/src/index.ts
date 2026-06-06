import type { ScheduledEvent } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import type { Bindings, WorkerCtx } from './bindings'
import { mountForceDispatchRoute } from './dispatch/force-route'
import { handleScheduled } from './dispatch/scheduled'
import { registerHealthRoute } from './health'
import { requireAccess } from './middleware/require-access'
import { mountScheduleRoutes } from './schedule/routes'
import { createSettingsRepo } from './settings/repo'
import { createRepo } from './subscribers/repo'
import { mountSubscriberRoutes } from './subscribers/routes'
import { mountUnsubscribeRoutes } from './unsubscribe/routes'
import { mountWebhookRoutes } from './webhooks/routes'

export type { Bindings } from './bindings'

const nowIso = (): string => new Date().toISOString()
const nowDate = (): Date => new Date()

const app = new Hono<WorkerCtx>()

registerHealthRoute(app)
app.use('/api/*', requireAccess())
mountSubscriberRoutes(app, c =>
  createRepo({ db: (c.env as Bindings).DB, now: nowIso })
)
mountScheduleRoutes(
  app,
  c => createSettingsRepo({ db: (c.env as Bindings).DB }),
  nowDate
)
mountForceDispatchRoute(app)
mountUnsubscribeRoutes(app)
mountWebhookRoutes(app)

/** Cloudflare Worker entry — Hono for HTTP, handleScheduled for crons. */
export default {
  fetch: app.fetch,
  scheduled: async (event: ScheduledEvent, env: Bindings): Promise<void> => {
    await handleScheduled({ scheduledTime: event.scheduledTime }, env)
  },
}

export { app }
