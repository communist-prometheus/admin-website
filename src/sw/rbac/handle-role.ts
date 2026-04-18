import { jsonResponse } from '../handlers/shared/json-response'
import { workerState } from '../state/state'
import { resolveRole } from './resolve-role'

/**
 * Handle GET /api/github/role — return current user's role.
 * @returns JSON response with role and username
 */
export const handleGetRole = (): Response => {
  const username = workerState.config?.username
  const role = username ? resolveRole(username) : undefined
  return jsonResponse({ role: role ?? undefined, username })
}
