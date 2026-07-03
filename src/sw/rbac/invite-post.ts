import { Option } from 'effect'
import { errorResponse, jsonResponse } from '../handlers/shared/json-response'
import { readGhError } from './gh-error'
import { API, ghHeaders } from './github-api'
import { buildInvite, type InviteBody } from './invite-build'

const postInvite = async (
  owner: string,
  token: string,
  payload: Record<string, unknown>
): Promise<Response> => {
  const res = await fetch(`${API}/orgs/${owner}/invitations`, {
    method: 'POST',
    headers: { ...ghHeaders(token), 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const txt = await res.text()
  return res.ok
    ? jsonResponse(JSON.parse(txt))
    : errorResponse(readGhError(txt) || `github ${res.status}`, res.status)
}

const toMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e)

const runInvite = async (
  owner: string,
  token: string,
  b: InviteBody
): Promise<Response> =>
  buildInvite(owner, token, b)
    .then(payload => postInvite(owner, token, payload))
    .catch(e => errorResponse(toMessage(e), 400))

const validate = (b: Partial<InviteBody>): Option.Option<InviteBody> =>
  b.role && (b.email || b.login)
    ? Option.some(b as InviteBody)
    : Option.none<InviteBody>()

/**
 * Validate the incoming body and either 400 or run the invite.
 *
 * @param owner org login
 * @param token OAuth bearer
 * @param raw parsed request body
 * @returns response to return to the client
 */
export const runInviteFromBody = async (
  owner: string,
  token: string,
  raw: Partial<InviteBody>
): Promise<Response> =>
  Option.match(validate(raw), {
    onNone: () => errorResponse('role and (email or login) required', 400),
    onSome: b => runInvite(owner, token, b),
  })
