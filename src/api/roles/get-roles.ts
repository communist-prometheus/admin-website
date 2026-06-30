import type { Context } from 'hono'
import type { Env } from '../app'
import { bearer, preflight } from './gate'
import type { RolesKv } from './kv-types'
import { resolveCaller } from './role-caller'
import { readRoles } from './role-store'

const fullMap = async (
  kv: RolesKv | undefined,
  token: string
): Promise<Response> => {
  const map = await readRoles(kv)
  const caller = await resolveCaller(map, token)
  return caller?.role === 'admin'
    ? Response.json(map)
    : new Response('Admin only', { status: 403 })
}

/**
 * GET /api/roles — the full role grant map. Admin only (caller's role
 * re-derived from their own token). Backs the Settings → Members UI.
 * @param c - Hono context (Env carries ROLES_KV).
 * @returns 200 role map, or 403 for non-admins.
 */
export const getRoles = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> =>
  preflight(c) ?? (await fullMap(c.env.ROLES_KV, bearer(c)))
