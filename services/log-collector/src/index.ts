import { Hono } from 'hono'
import { registerHealthRoute } from './health'

/** Hono app composed of all registered routes. */
export const app = registerHealthRoute(
  new Hono<{ Bindings: { VERSION: string } }>()
)

/** Cloudflare Worker entry — delegates everything to Hono. */
export default {
  fetch: app.fetch,
}
