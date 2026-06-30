import { Hono } from 'hono'
import { corsProxy } from './cors-proxy'
import { getMyRole } from './roles/get-my-role'
import { getRoles } from './roles/get-roles'
import type { RolesKv } from './roles/kv-types'
import { putRole } from './roles/put-role'
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
  /**
   * App-role grant store (editor / chief-editor / admin). Replaces the
   * former `.admin/roles.json` content-repo file so role changes apply
   * immediately. Optional — absent in local dev → empty map, org admins
   * still resolve to `admin`.
   */
  readonly ROLES_KV?: RolesKv
}

/**
 * Shared Hono app for API routes.
 * basePath /api — matches both CF Workers and Vite dev.
 */
export const api = new Hono<{ Bindings: Env }>()
  .basePath('/api')
  .post('/oauth/token', tokenHandler)
  .post('/tickets/attach', ticketsAttach)
  .get('/roles/me', getMyRole)
  .get('/roles', getRoles)
  .put('/roles', putRole)
  .all('/cors/*', corsProxy)
