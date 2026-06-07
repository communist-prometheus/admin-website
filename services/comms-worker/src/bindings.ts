import type { D1Database } from '@cloudflare/workers-types'
import type { SessionClaims } from './auth/session-types'
import type { DispatchEnv } from './dispatch/runtime-env'
import type { CorsEnv } from './middleware/cors'
import type { RequireSessionEnv } from './middleware/require-session'
import type { UnsubscribeEnv } from './unsubscribe/runtime-env'
import type { WebhookEnv } from './webhooks/runtime-env'

/** Combined worker bindings across all registered routes. */
export type Bindings = RequireSessionEnv &
  CorsEnv &
  DispatchEnv &
  UnsubscribeEnv &
  WebhookEnv & {
    readonly VERSION: string
    readonly ADMIN_HOSTNAME: string
    readonly DB: D1Database
  }

/** Per-request Hono variables exposed by the session middleware. */
export type Vars = { readonly session: SessionClaims }

/** Convenience alias used by every Hono mount helper. */
export type WorkerCtx = { Bindings: Bindings; Variables: Vars }
