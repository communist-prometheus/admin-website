import { errorResponse } from '../handlers/shared/json-response'
import { workerState } from '../state/state'
import { isOrgAdmin } from './org-admin-cache'

/*
 * Defense-in-depth gate for privileged GitHub-org mutations (team
 * set-role, invite, revoke). The SW holds the logged-in user's token
 * and would otherwise act as a confused deputy: any same-origin script
 * (e.g. via an XSS foothold) could POST /api/github/org-role and
 * promote an arbitrary account. These operations write GitHub org/team
 * membership, so the gate is GitHub org-admin specifically (app-role
 * grants live in KV and are gated server-side by the /api/roles
 * endpoints instead). UI-level gating is not a security boundary.
 */

/**
 * Require the current SW user to be a GitHub org admin.
 * @returns 403 Response when the user is not an org admin, undefined
 * when the request may proceed.
 */
export const requireAdmin = (): Response | undefined => {
  const username = workerState.config?.username
  return username && isOrgAdmin(username)
    ? undefined
    : errorResponse('Admin only', 403)
}
