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
 * Pass the email straight through to POST /orgs/{org}/invitations. GitHub
 * itself matches the address against verified addresses on any account,
 * including PRIVATE ones — the public /search/users endpoint we used to
 * pre-flight against does NOT (index-limited to public emails), which is
 * why every ProtonMail/HEY/noreply address dead-ended in the dialog even
 * when the receiver had a perfectly good GitHub account.
 *
 * On a match GitHub attaches the invite to that account's notifications;
 * on no match GitHub emails a cold sign-up-and-join link. Both outcomes
 * are legitimate — the caller decides. A rejection (422 etc.) surfaces
 * as an error the dialog can offer the "try as @username" fallback for.
 */
const byEmail = (
  base: Record<string, unknown>,
  email: string
): Record<string, unknown> => ({ ...base, email })

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
    ? byEmail(base, body.email)
    : byLogin(base, body.login ?? '', token)
}
