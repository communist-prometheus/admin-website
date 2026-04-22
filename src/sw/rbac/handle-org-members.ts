import { errorResponse, jsonResponse } from '../handlers/shared/json-response'
import { workerState } from '../state/state'
import { setOrgAdmins } from './org-admin-cache'

interface OrgMember {
  readonly login: string
}

const fetchJson = async (
  url: string,
  token: string
): Promise<OrgMember[]> => {
  const res = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
    },
  })
  if (!res.ok) throw new Error(`github ${res.status}`)
  const json: unknown = await res.json()
  return Array.isArray(json) ? (json as OrgMember[]) : []
}

/**
 * Handle GET /api/github/org-members — return the list of GitHub
 * org administrators by login. Returns `{ admins: [] }` on any
 * failure so the UI can degrade gracefully. Also updates the
 * local SW cache so resolveRole() treats org admins as implicit
 * app admins.
 *
 * @returns JSON response with the list of org admin logins
 */
export const handleGetOrgMembers = async (): Promise<Response> => {
  const config = workerState.config
  if (!config) return errorResponse('SW not initialised', 503)
  try {
    const url = `https://api.github.com/orgs/${config.owner}/members?role=admin&per_page=100`
    const members = await fetchJson(url, config.token)
    const admins = members.map(m => m.login)
    setOrgAdmins(admins)
    return jsonResponse({ admins })
  } catch {
    setOrgAdmins([])
    return jsonResponse({ admins: [] })
  }
}
