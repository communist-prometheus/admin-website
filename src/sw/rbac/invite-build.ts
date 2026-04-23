import { API, ghJson } from './github-api'
import { teamIdsFor } from './team-lookup'

/** Body accepted by the invite endpoint. */
export interface InviteBody {
  readonly email?: string
  readonly login?: string
  readonly role: 'admin' | 'chief-editor' | 'editor'
}

interface UserRef {
  readonly id: number
}

const resolveLogin = (
  login: string,
  token: string
): Promise<number | undefined> =>
  ghJson<UserRef>(`${API}/users/${login}`, token)
    .then(u => u.id)
    .catch(() => undefined)

const byLogin = async (
  base: Record<string, unknown>,
  login: string,
  token: string
): Promise<Record<string, unknown>> => {
  const invitee_id = await resolveLogin(login, token)
  return invitee_id ? { ...base, invitee_id } : base
}

/**
 * Build the payload for POST /orgs/{org}/invitations from the
 * client's invite body: team_ids derived from the mapped team,
 * `role` set to GitHub's vocabulary, and either an email or an
 * invitee_id resolved from a login.
 *
 * @param owner org login
 * @param token OAuth bearer with admin:org
 * @param body invite request
 * @returns payload ready to send to GitHub
 */
export const buildInvite = async (
  owner: string,
  token: string,
  body: InviteBody
): Promise<Record<string, unknown>> => {
  const team_ids = await teamIdsFor(owner, token, body.role)
  const role = body.role === 'admin' ? 'admin' : 'direct_member'
  const base = { role, team_ids }
  return body.email !== undefined
    ? { ...base, email: body.email }
    : byLogin(base, body.login ?? '', token)
}
