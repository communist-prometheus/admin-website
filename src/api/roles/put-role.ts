import type { Context } from 'hono'
import type { Env } from '../app'
import { storeRoleAndSync } from './assign-role'
import { toAssignment } from './assignment'
import { bearer, preflight } from './gate'
import type { RolesKv } from './kv-types'
import { resolveCaller } from './role-caller'
import { readRoles } from './role-store'

interface AssignBody {
  readonly login?: string
  readonly role?: string
}

const assign = async (
  kv: RolesKv | undefined,
  token: string,
  body: AssignBody
): Promise<Response> => {
  const map = await readRoles(kv)
  const caller = await resolveCaller(map, token)
  const role = toAssignment(body.role)
  const login = typeof body.login === 'string' ? body.login : undefined
  return caller?.role !== 'admin'
    ? new Response('Admin only', { status: 403 })
    : kv && login && role
      ? storeRoleAndSync(kv, token, map, login, role)
      : new Response('Bad request', { status: 400 })
}

/**
 * PUT /api/roles — assign `{ login, role }` (role ∈ editor | chief-editor
 * | admin | none). Admin only, caller re-derived from their own token.
 * Writes KV AND syncs content-repo collaborator access so the grant is
 * effective both in the UI and for content-repo push access.
 *
 * @param c Hono context (Env carries ROLES_KV).
 * @returns 200 updated map, 400 bad body, 403 non-admin, 502 sync fail.
 */
export const putRole = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> => {
  const body: AssignBody = await c.req.json().catch(() => ({}))
  return preflight(c) ?? (await assign(c.env.ROLES_KV, bearer(c), body))
}
