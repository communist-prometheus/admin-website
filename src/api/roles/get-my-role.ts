import type { Context } from 'hono'
import type { Env } from '../app'
import { bearer, preflight } from './gate'
import type { RolesKv } from './kv-types'
import { resolveCaller } from './role-caller'
import { readRoles } from './role-store'

const myRole = async (
  kv: RolesKv | undefined,
  token: string
): Promise<Response> => {
  const resolved = await resolveCaller(await readRoles(kv), token)
  return resolved === undefined
    ? new Response('Invalid or unauthorized token', { status: 403 })
    : Response.json({
        role: resolved.role ?? null,
        username: resolved.username,
      })
}

/**
 * GET /api/roles/me — the caller's own effective role. Org admins are
 * always `admin`; otherwise the KV grant (or null). The SW uses this at
 * init to gate content mutations, so it reflects the KV store instantly
 * without a content-repo commit.
 * @param c - Hono context (Env carries ROLES_KV).
 * @returns 200 `{ role, username }`, or 403 for non-members.
 */
export const getMyRole = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> =>
  preflight(c) ?? (await myRole(c.env.ROLES_KV, bearer(c)))
