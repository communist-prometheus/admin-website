const ORG = 'communist-prometheus'
const GH = 'https://api.github.com'

const headers = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'prometheus-admin',
  'content-type': 'application/json',
})

const membershipUrl = (teamSlug: string, login: string): string =>
  `${GH}/orgs/${ORG}/teams/${teamSlug}/memberships/${login}`

/**
 * PUT the user's membership in a GitHub team. 200 = updated, 201 =
 * pending invite created (login isn't in the org yet). The `member`
 * role — not `maintainer` — is enough for content-repo push access.
 *
 * @param token Admin caller's OAuth token (admin:org scope required).
 * @param teamSlug Target team's URL slug.
 * @param login GitHub login to add.
 * @returns The raw fetch Response.
 */
export const putTeamMembership = async (
  token: string,
  teamSlug: string,
  login: string
): Promise<Response> =>
  fetch(membershipUrl(teamSlug, login), {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ role: 'member' }),
  })

/**
 * DELETE the user's team membership. 204 = removed, 404 = wasn't a
 * member. Both are non-errors from the sync's point of view.
 *
 * @param token Admin caller's OAuth token (admin:org scope required).
 * @param teamSlug Target team's URL slug.
 * @param login GitHub login to remove.
 * @returns The raw fetch Response.
 */
export const deleteTeamMembership = async (
  token: string,
  teamSlug: string,
  login: string
): Promise<Response> =>
  fetch(membershipUrl(teamSlug, login), {
    method: 'DELETE',
    headers: headers(token),
  })
