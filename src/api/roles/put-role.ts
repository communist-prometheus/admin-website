import type { Context } from 'hono'
import type { Env } from '../app'
import { toAssignment } from './assignment'
import { bearer, preflight } from './gate'
import type { RolesKv } from './kv-types'
import { resolveCaller } from './role-caller'
import type { RoleAssignment, RoleMap } from './role-map'
import { applyRole } from './role-mutate'
import { readRoles, writeRoles } from './role-store'

interface AssignBody {
  readonly login?: string
  readonly role?: string
}

const store = async (
  kv: RolesKv,
  map: RoleMap,
  login: string,
  role: RoleAssignment
): Promise<Response> => {
  const next = applyRole(map, login, role)
  await writeRoles(kv, next)
  return Response.json(next)
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
      ? store(kv, map, login, role)
      : new Response('Bad request', { status: 400 })
}

/**
 * PUT /api/roles — assign `{ login, role }` (role ∈ editor | chief-editor
 * | admin | none). Admin only, caller re-derived from their own token.
 * Writes KV so the grant is effective immediately, no content commit.
 * @param c - Hono context (Env carries ROLES_KV).
 * @returns 200 updated map, 400 bad body, or 403 for non-admins.
 */
export const putRole = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> => {
  const body: AssignBody = await c.req.json().catch(() => ({}))
  return preflight(c) ?? (await assign(c.env.ROLES_KV, bearer(c), body))
}
