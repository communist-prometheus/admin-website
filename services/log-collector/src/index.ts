import { Hono } from 'hono'
import {
  type AuthBindings,
  type AuthVariables,
  authMiddleware,
} from './auth-middleware'
import { batchSizeGuard } from './batch-size-guard'
import {
  type ExchangeBindings,
  registerExchangeRoute,
} from './exchange-handler'
import { registerHealthRoute } from './health'
import { type OtlpBindings, registerOtlpRoutes } from './otlp-handlers'
import { rateLimit } from './rate-limit'
import { registerSseRoute } from './sse-handler'

/** Combined worker bindings across all registered routes. */
export type Bindings = AuthBindings &
  ExchangeBindings &
  OtlpBindings & {
    readonly VERSION: string
  }

const app = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>()
app.use('*', authMiddleware())
app.use('/v1/*', batchSizeGuard())
app.use('/v1/*', rateLimit())
registerHealthRoute(app)
registerExchangeRoute(app)
registerOtlpRoutes(app)
registerSseRoute(app)

/** Cloudflare Worker entry — delegates everything to Hono. */
export default {
  fetch: app.fetch,
}

export { app }
