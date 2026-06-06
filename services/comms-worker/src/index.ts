import type { ScheduledEvent } from '@cloudflare/workers-types'
import { createApp } from './app'
import type { Bindings } from './bindings'
import { handleScheduled } from './dispatch/scheduled'

export type { Bindings } from './bindings'

const app = createApp()

/** Cloudflare Worker entry — Hono for HTTP, handleScheduled for crons. */
export default {
  fetch: app.fetch,
  scheduled: async (event: ScheduledEvent, env: Bindings): Promise<void> => {
    await handleScheduled({ scheduledTime: event.scheduledTime }, env)
  },
}

export { app }
