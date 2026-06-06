import type { D1Database } from '@cloudflare/workers-types'

/** Bindings + secrets required by the Resend webhook route. */
export type WebhookEnv = {
  readonly DB: D1Database
  readonly RESEND_WEBHOOK_SECRET: string
}
