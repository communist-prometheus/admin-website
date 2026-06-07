import type { SessionClaims } from './jwt/types'

/**
 * Worker env bindings. Values listed under `vars` in wrangler.jsonc
 * arrive as plain strings; `JWT_SECRET` is a secret pushed via
 * `wrangler secret put` and is missing at deploy-time until set.
 */
export type Bindings = {
  readonly VERSION: string
  readonly GITHUB_ORG: string
  readonly ALLOWED_ORIGIN: string
  readonly COOKIE_DOMAIN: string
  readonly JWT_SECRET: string
}

/** Per-request Hono variables. */
export type Vars = { readonly session: SessionClaims }

/** Convenience alias for Hono mount helpers. */
export type WorkerCtx = { Bindings: Bindings; Variables: Vars }
