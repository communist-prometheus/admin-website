import { API, ghJson } from './github-api'
import { resolveEmailToUser } from './resolve-invite-email'
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

const resolveLogin = (login: string, token: string): Promise<number> =>
  ghJson<UserRef>(`${API}/users/${login}`, token).then(u => u.id)

const byLogin = async (
  base: Record<string, unknown>,
  login: string,
  token: string
): Promise<Record<string, unknown>> => {
  const invitee_id = await resolveLogin(login, token)
  return { ...base, invitee_id }
}

/*
 * Resolving an email to a GitHub user before inviting avoids the
 * two regressions the user hit:
 *   - Inviting an email whose owner already has a GH account would
 *     fail at the org-invitations endpoint. By resolving to invitee_id
 *     we use the same code path as a login invite, which GH accepts.
 *   - Inviting a totally unregistered email puts the org on GitHub's
 *     spam radar. We refuse those invites explicitly with a message
 *     telling the editor to use a username instead.
 */
const byEmail = async (
  base: Record<string, unknown>,
  email: string,
  token: string
): Promise<Record<string, unknown>> => {
  const user = await resolveEmailToUser(email, token)
  return user
    ? { ...base, invitee_id: user.id }
    : Promise.reject(
        new Error(
          `No GitHub account is associated with ${email}. Ask the person ` +
            `to make their email public on GitHub or invite by username.`
        )
      )
}

/**
 * Build the payload for POST /orgs/{org}/invitations.
 *
 * @param owner - Org login
 * @param token - OAuth bearer with admin:org
 * @param body - Invite request
 * @returns Payload ready to send to GitHub
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
    ? byEmail(base, body.email, token)
    : byLogin(base, body.login ?? '', token)
}
