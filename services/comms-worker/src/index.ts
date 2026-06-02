import { Hono } from 'hono'
import { registerHealthRoute } from './health'

/** Combined worker bindings across all registered routes. */
export type Bindings = {
  readonly VERSION: string
  readonly ADMIN_HOSTNAME: string
}

const app = new Hono<{ Bindings: Bindings }>()
registerHealthRoute(app)

/** Cloudflare Worker entry — delegates everything to Hono. */
export default {
  fetch: app.fetch,
}

export { app }
