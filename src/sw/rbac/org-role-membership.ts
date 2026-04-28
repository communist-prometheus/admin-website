import { API, ghHeaders } from './github-api'
import { ensureOk } from './response-ok'
import { teamMembershipOp } from './team-membership-ops'
import { TEAM_SLUGS, type TeamRole } from './team-slugs'

/**
 * PUT the org membership for a user. Throws on a non-OK response
 * so the caller surfaces a real error.
 *
 * @param owner - Org login
 * @param login - User login
 * @param role - admin or member
 * @param token - OAuth bearer with admin:org
 */
export const setOrgRole = async (
  owner: string,
  login: string,
  role: 'admin' | 'member',
  token: string
): Promise<void> => {
  const res = await fetch(`${API}/orgs/${owner}/memberships/${login}`, {
    method: 'PUT',
    headers: { ...ghHeaders(token), 'content-type': 'application/json' },
    body: JSON.stringify({ role }),
  })
  await ensureOk(res, 'org-membership')
}

/**
 * Add a user to one of the reserved app-role teams. Throws on a
 * non-OK response.
 *
 * @param owner - Org login
 * @param login - User login
 * @param token - OAuth bearer
 * @param team - Target team role
 */
export const addToTeam = async (
  owner: string,
  login: string,
  token: string,
  team: TeamRole
): Promise<void> => {
  const slug = TEAM_SLUGS[team]
  const res = await teamMembershipOp(owner, slug, login, token, 'PUT')
  await ensureOk(res, `team-membership ${slug}`)
}
