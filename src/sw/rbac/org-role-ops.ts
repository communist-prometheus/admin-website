import { Match, Option } from 'effect'
import { addToTeam, setOrgRole } from './org-role-membership'
import { clearReservedTeams } from './team-membership-ops'
import type { TeamRole } from './team-slugs'

/** Body of a role-change request. */
export interface SetRoleBody {
  readonly login: string
  readonly role: 'admin' | 'chief-editor' | 'editor' | 'none'
}

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
 * Every fetch result is checked: a non-OK response from any of
 * the three steps surfaces as a thrown error so the SW handler
 * can return 5xx and the UI can react.
 *
 * @param owner - Org login
 * @param token - OAuth bearer with admin:org
 * @param body - Role-change payload
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
    onNone: () => Promise.resolve(),
    onSome: r => addToTeam(owner, body.login, token, r),
  })
}
