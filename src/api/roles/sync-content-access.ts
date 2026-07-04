/*
 * KV role assignment → content-repo write access sync.
 *
 * The KV role map controls what the admin app allows in its UI. It
 * does NOT grant push access to the content repo — that comes from
 * being a direct collaborator on the repo, because content edits push
 * with the caller's OWN OAuth token via isomorphic-git.
 *
 * Existing content editors are direct collaborators with the `push`
 * permission — the org has no team infrastructure for this. When an
 * admin assigns a KV role we mirror it onto collaborator status:
 *
 *   editor / chief-editor / admin → PUT collaborator (permission: push)
 *   none                          → DELETE collaborator
 *
 * A PUT for a login who isn't yet a collaborator creates a repo invite
 * they accept in one click; a PUT for an existing collaborator no-ops
 * to 204. Admins keep push access too — they need to author commits
 * from the same app path as editors do.
 */

import { grantContentPush, revokeContentAccess } from './collaborator-api'
import { requireDeleteCollab, requirePutCollab } from './collaborator-guards'
import type { RoleAssignment } from './role-map'

const grants = (role: RoleAssignment): boolean => role !== 'none'

const applyGrant = async (token: string, login: string): Promise<void> =>
  requirePutCollab(await grantContentPush(token, login))

const applyRevoke = async (token: string, login: string): Promise<void> =>
  requireDeleteCollab(await revokeContentAccess(token, login))

/**
 * Sync content-repo collaborator access to match a KV role assignment.
 *
 * @param token Admin caller's OAuth token; the `repo` scope is required
 *   to PUT/DELETE collaborators. Passed through — no downgrade.
 * @param login GitHub login whose access is being aligned.
 * @param role The role now written to KV.
 * @returns Resolves once the collaborator PUT/DELETE settles OK.
 * @throws Error with a `grant/revoke ...: <status>` prefix when
 *   GitHub rejects the call.
 */
export const syncContentAccess = async (
  token: string,
  login: string,
  role: RoleAssignment
): Promise<void> =>
  grants(role) ? applyGrant(token, login) : applyRevoke(token, login)
