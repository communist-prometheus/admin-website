import type { D1Database } from '@cloudflare/workers-types'

/** Bindings + secrets required by the public unsubscribe routes. */
export type UnsubscribeEnv = {
  readonly DB: D1Database
  readonly UNSUBSCRIBE_SECRET: string
}
