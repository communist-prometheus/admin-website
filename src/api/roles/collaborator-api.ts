const GH = 'https://api.github.com'
const ORG = 'communist-prometheus'
const CONTENT_REPO = 'public-website-content'
const TICKETS_REPO = 'tickets'

const headers = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'prometheus-admin',
  'content-type': 'application/json',
})

const collabUrl = (repo: string, login: string): string =>
  `${GH}/repos/${ORG}/${repo}/collaborators/${login}`

const putCollab = (
  token: string,
  repo: string,
  login: string
): Promise<Response> =>
  fetch(collabUrl(repo, login), {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ permission: 'push' }),
  })

const deleteCollab = (
  token: string,
  repo: string,
  login: string
): Promise<Response> =>
  fetch(collabUrl(repo, login), { method: 'DELETE', headers: headers(token) })

/**
 * PUT a direct collaborator on the content repo with `push` permission
 * (GitHub's name for read-write). 201 = new invite created (user not yet
 * a collaborator — accepting the invite is a one-click UI action), 204 =
 * permission already matches, 200 = permission updated.
 * @param token Admin caller's OAuth token (repo scope required).
 * @param login GitHub login to grant push access.
 * @returns The raw fetch Response.
 */
export const grantContentPush = (
  token: string,
  login: string
): Promise<Response> => putCollab(token, CONTENT_REPO, login)

/**
 * DELETE the content-repo collaborator record. 204 = removed, 404 = wasn't
 * a collaborator. Both are fine — the desired end state is "no write".
 * @param token Admin caller's OAuth token (repo scope required).
 * @param login GitHub login to revoke access from.
 * @returns The raw fetch Response.
 */
export const revokeContentAccess = (
  token: string,
  login: string
): Promise<Response> => deleteCollab(token, CONTENT_REPO, login)

/**
 * PUT a direct collaborator on the tickets repo with `push` permission so
 * role-holders can write ticket attachments with their OWN token (the
 * attach endpoint no longer needs a service token). Same 201/204/200
 * semantics as {@link grantContentPush}.
 * @param token Admin caller's OAuth token (repo scope required).
 * @param login GitHub login to grant push access.
 * @returns The raw fetch Response.
 */
export const grantTicketsPush = (
  token: string,
  login: string
): Promise<Response> => putCollab(token, TICKETS_REPO, login)

/**
 * DELETE the tickets-repo collaborator record. 204 = removed, 404 = wasn't
 * a collaborator — both acceptable.
 * @param token Admin caller's OAuth token (repo scope required).
 * @param login GitHub login to revoke access from.
 * @returns The raw fetch Response.
 */
export const revokeTicketsAccess = (
  token: string,
  login: string
): Promise<Response> => deleteCollab(token, TICKETS_REPO, login)
