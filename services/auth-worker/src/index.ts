import { createApp } from './app'

export type { Bindings } from './bindings'

const app = createApp()

/** Cloudflare Worker entry — HTTP only, no cron triggers. */
export default { fetch: app.fetch }

export { app }
