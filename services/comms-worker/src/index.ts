import type { D1Database } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import type { AccessClaims } from './auth/cf-access'
import { registerHealthRoute } from './health'
import {
  type RequireAccessEnv,
  requireAccess,
} from './middleware/require-access'
import { createRepo } from './subscribers/repo'
import { mountSubscriberRoutes } from './subscribers/routes'

/** Combined worker bindings across all registered routes. */
export type Bindings = RequireAccessEnv & {
  readonly VERSION: string
  readonly ADMIN_HOSTNAME: string
  readonly DB: D1Database
}

type Vars = { readonly access: AccessClaims }
type WorkerCtx = { Bindings: Bindings; Variables: Vars }

const nowIso = (): string => new Date().toISOString()

const app = new Hono<WorkerCtx>()

registerHealthRoute(app)
app.use('/api/*', requireAccess())
mountSubscriberRoutes(app, c =>
  createRepo({ db: (c.env as Bindings).DB, now: nowIso })
)

/** Cloudflare Worker entry — delegates everything to Hono. */
export default {
  fetch: app.fetch,
}

export { app }
