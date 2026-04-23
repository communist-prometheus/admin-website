import { Match, Option } from 'effect'
import { API, ghHeaders } from './github-api'
import { clearReservedTeams, teamMembershipOp } from './team-membership-ops'
import { TEAM_SLUGS, type TeamRole } from './team-slugs'

/** Body of a role-change request. */
export interface SetRoleBody {
  readonly login: string
  readonly role: 'admin' | 'chief-editor' | 'editor' | 'none'
}

const setOrgRole = (
  owner: string,
  login: string,
  role: 'admin' | 'member',
  token: string
): Promise<Response> =>
  fetch(`${API}/orgs/${owner}/memberships/${login}`, {
    method: 'PUT',
    headers: { ...ghHeaders(token), 'content-type': 'application/json' },
    body: JSON.stringify({ role }),
  })

const toTeamRole = (role: SetRoleBody['role']): Option.Option<TeamRole> =>
  Match.value(role).pipe(
    Match.when('editor', () => Option.some('editor' as TeamRole)),
    Match.when('chief-editor', () => Option.some('chief-editor' as TeamRole)),
    Match.orElse(() => Option.none<TeamRole>())
  )

/**
 * Apply a role change via the GitHub org + teams APIs: set org
 * role (admin or member), clear reserved team memberships, add
 * to the target team when the role is editor or chief-editor.
 *
 * @param owner org login
 * @param token OAuth bearer with admin:org
 * @param body role-change payload
 */
export const applyRole = async (
  owner: string,
  token: string,
  body: SetRoleBody
): Promise<void> => {
  const orgRole = body.role === 'admin' ? 'admin' : 'member'
  await setOrgRole(owner, body.login, orgRole, token)
  await clearReservedTeams(owner, body.login, token)
  await Option.match(toTeamRole(body.role), {
    onNone: () => Promise.resolve<unknown>(undefined),
    onSome: r =>
      teamMembershipOp(owner, TEAM_SLUGS[r], body.login, token, 'PUT'),
  })
}
