const GH = 'https://api.github.com'
const ORG = 'communist-prometheus'
const REPO = 'public-website-content'

const headers = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'prometheus-admin',
  'content-type': 'application/json',
})

const collabUrl = (login: string): string =>
  `${GH}/repos/${ORG}/${REPO}/collaborators/${login}`

/**
 * PUT a direct collaborator on the content repo with `push` permission
 * (GitHub's name for read-write). 201 = new invite created (user not yet
 * a collaborator — accepting the invite is a one-click UI action), 204 =
 * permission already matches, 200 = permission updated.
 *
 * @param token Admin caller's OAuth token (repo scope required).
 * @param login GitHub login to grant push access.
 * @returns The raw fetch Response.
 */
export const grantContentPush = async (
  token: string,
  login: string
): Promise<Response> =>
  fetch(collabUrl(login), {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ permission: 'push' }),
  })

/**
 * DELETE the direct collaborator record. 204 = removed, 404 = wasn't a
 * collaborator. Both are fine — the desired end state is "no write".
 *
 * @param token Admin caller's OAuth token (repo scope required).
 * @param login GitHub login to revoke access from.
 * @returns The raw fetch Response.
 */
export const revokeContentAccess = async (
  token: string,
  login: string
): Promise<Response> =>
  fetch(collabUrl(login), {
    method: 'DELETE',
    headers: headers(token),
  })
