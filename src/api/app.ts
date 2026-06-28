import { Hono } from 'hono'
import { corsProxy } from './cors-proxy'
import { ticketsAttach } from './tickets-attach'
import { tokenHandler } from './token-handler'

/**
 * Env bindings available on CF Workers and in Vite dev.
 * GITHUB_CLIENT_ID is a public value pinned per environment in
 * wrangler.jsonc — the token handler rejects exchanges for any
 * other client. Optional so local dev without vars keeps working.
 */
export interface Env {
  readonly GITHUB_CLIENT_SECRET: string
  readonly GITHUB_CLIENT_ID?: string
  /**
   * GitHub token with contents:write on the private `tickets` repo, used
   * by POST /api/tickets/attach so editors need no direct repo access.
   * Optional — absent → the endpoint returns 503 and attachments stay
   * best-effort. Provisioned by the owner via `wrangler secret put`.
   */
  readonly TICKETS_TOKEN?: string
}

/**
 * Shared Hono app for API routes.
 * basePath /api — matches both CF Workers and Vite dev.
 */
export const api = new Hono<{ Bindings: Env }>()
  .basePath('/api')
  .post('/oauth/token', tokenHandler)
  .post('/tickets/attach', ticketsAttach)
  .all('/cors/*', corsProxy)
