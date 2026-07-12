import type { D1Database } from '@cloudflare/workers-types'

/** Worker bindings + secrets the dispatch path requires at runtime. */
export type DispatchEnv = {
  readonly DB: D1Database
  readonly RESEND_API_KEY: string
  readonly UNSUBSCRIBE_SECRET: string
  readonly FROM_ADDRESS?: string
  readonly PUBLIC_BASE_URL?: string
  /**
   * Base URL of the public content site the digest reads RSS +
   * magazine feeds from. Unset on prod (defaults to comprom.org);
   * the develop env points it at dev.comprom.org so test mailings
   * never touch production content.
   */
  readonly CONTENT_BASE_URL?: string
}

/** Default sender displayed in the From header. */
export const DEFAULT_FROM = 'Communist Prometheus <newsletter@comprom.org>'

/** Default base URL where the worker serves the unsubscribe surface. */
export const DEFAULT_PUBLIC_BASE = 'https://lists.comprom.org'
