import { errorResponse, jsonResponse } from '../handlers/shared/json-response'
import { workerState } from '../state/state'
import { loadOrgMembers } from './fetch-org-members'
import { setOrgAdmins } from './org-admin-cache'
import type { OrgMember } from './org-members-types'

const MOCK_MEMBERS: readonly OrgMember[] = [
  { login: 'alice-admin', orgRole: 'admin' },
  { login: 'bob-editor', orgRole: 'member' },
  { login: 'carol-reader', orgRole: 'member' },
]

const primeAdminCacheFromMock = (): void =>
  setOrgAdmins(
    MOCK_MEMBERS.filter(m => m.orgRole === 'admin').map(m => m.login)
  )

/**
 * Handle GET /api/github/org-members — return every GitHub
 * organisation member with their org role (admin or member). In
 * mock mode, a small fixture is returned. Falls back to
 * `{ members: [] }` on failure so the UI degrades gracefully.
 *
 * @returns JSON response with the list of org members
 */
export const handleGetOrgMembers = async (): Promise<Response> => {
  const config = workerState.config
  if (!config) return errorResponse('SW not initialised', 503)
  if (__MOCK_MODE__ || config.mock) {
    primeAdminCacheFromMock()
    return jsonResponse({ members: MOCK_MEMBERS })
  }
  try {
    const members = await loadOrgMembers(config.owner, config.token)
    return jsonResponse({ members })
  } catch {
    setOrgAdmins([])
    return jsonResponse({ members: [] })
  }
}
