import type { D1Database } from '@cloudflare/workers-types'
import type { AccessClaims } from './auth/cf-access'
import type { DispatchEnv } from './dispatch/runtime-env'
import type { RequireAccessEnv } from './middleware/require-access'
import type { UnsubscribeEnv } from './unsubscribe/runtime-env'
import type { WebhookEnv } from './webhooks/runtime-env'

/** Combined worker bindings across all registered routes. */
export type Bindings = RequireAccessEnv &
  DispatchEnv &
  UnsubscribeEnv &
  WebhookEnv & {
    readonly VERSION: string
    readonly ADMIN_HOSTNAME: string
    readonly DB: D1Database
  }

/** Per-request Hono variables exposed by the access middleware. */
export type Vars = { readonly access: AccessClaims }

/** Convenience alias used by every Hono mount helper. */
export type WorkerCtx = { Bindings: Bindings; Variables: Vars }
