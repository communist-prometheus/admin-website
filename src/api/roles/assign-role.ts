import type { RolesKv } from './kv-types'
import type { RoleAssignment, RoleMap } from './role-map'
import { applyRole } from './role-mutate'
import { writeRoles } from './role-store'
import { syncTeamMembership } from './sync-team-membership'

const toMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e)

/**
 * Persist the KV role change AND sync GitHub team membership.
 *
 * Editors and chief-editors get push access on the content repo via
 * team membership — content edits push with the caller's OWN OAuth
 * token via isomorphic-git, so the KV grant alone doesn't unlock push.
 *
 * KV is written first (fast path, effective immediately for UI). The
 * team sync runs after; on failure we surface 502 with the GitHub
 * error and the admin retries. That leaves KV briefly ahead of team
 * state, but a stale 502 message is better than a silent divergence
 * where the UI says "editor" but the push fails with 403.
 *
 * @param kv KV binding for the role store.
 * @param token Admin caller's OAuth token (admin:org scope).
 * @param map Current role map (pre-mutation).
 * @param login Target GitHub login.
 * @param role Role to assign, or `none` to clear.
 * @returns The updated map (200) or the sync-failure envelope (502).
 */
export const storeRoleAndSync = async (
  kv: RolesKv,
  token: string,
  map: RoleMap,
  login: string,
  role: RoleAssignment
): Promise<Response> => {
  const next = applyRole(map, login, role)
  await writeRoles(kv, next)
  try {
    await syncTeamMembership(token, login, role)
  } catch (e) {
    return new Response(
      `Role stored but team membership sync failed: ${toMessage(e)}`,
      { status: 502 }
    )
  }
  return Response.json(next)
}
