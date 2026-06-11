import { errorResponse } from '../handlers/shared/json-response'
import { workerState } from '../state/state'
import { resolveRole } from './resolve-role'

/*
 * Defense-in-depth gate for privileged RBAC mutations (set-role,
 * invite, revoke). The SW holds the logged-in user's token and would
 * otherwise act as a confused deputy: any same-origin script (e.g.
 * via an XSS foothold) could POST /api/github/org-role and promote
 * an arbitrary account. UI-level gating is not a security boundary —
 * this is the same check handle-roles-config.ts already performs.
 */

/**
 * Require the current SW user to hold the admin role.
 * @returns 403 Response when the user is not an admin, undefined
 * when the request may proceed
 */
export const requireAdmin = (): Response | undefined => {
  const username = workerState.config?.username
  const role = username ? resolveRole(username) : undefined
  return role === 'admin' ? undefined : errorResponse('Admin only', 403)
}
