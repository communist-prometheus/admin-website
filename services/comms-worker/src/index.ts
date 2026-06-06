import type { D1Database, ScheduledEvent } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import type { AccessClaims } from './auth/cf-access'
import { mountForceDispatchRoute } from './dispatch/force-route'
import type { DispatchEnv } from './dispatch/runtime-env'
import { handleScheduled } from './dispatch/scheduled'
import { registerHealthRoute } from './health'
import {
  type RequireAccessEnv,
  requireAccess,
} from './middleware/require-access'
import { mountScheduleRoutes } from './schedule/routes'
import { createSettingsRepo } from './settings/repo'
import { createRepo } from './subscribers/repo'
import { mountSubscriberRoutes } from './subscribers/routes'

/** Combined worker bindings across all registered routes. */
export type Bindings = RequireAccessEnv &
  DispatchEnv & {
    readonly VERSION: string
    readonly ADMIN_HOSTNAME: string
    readonly DB: D1Database
  }

type Vars = { readonly access: AccessClaims }
type WorkerCtx = { Bindings: Bindings; Variables: Vars }

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

/** Cloudflare Worker entry — Hono for HTTP, handleScheduled for crons. */
export default {
  fetch: app.fetch,
  scheduled: async (event: ScheduledEvent, env: Bindings): Promise<void> => {
    await handleScheduled({ scheduledTime: event.scheduledTime }, env)
  },
}

export { app }
