import { API, ghHeaders } from './github-api'
import { TEAM_SLUGS } from './team-slugs'

/**
 * Put or delete a user in a GitHub team by slug.
 *
 * @param owner org login
 * @param slug team slug
 * @param login GitHub login to change
 * @param token OAuth bearer
 * @param method PUT to add, DELETE to remove
 * @returns raw GitHub response
 */
export const teamMembershipOp = (
  owner: string,
  slug: string,
  login: string,
  token: string,
  method: 'PUT' | 'DELETE'
): Promise<Response> =>
  fetch(`${API}/orgs/${owner}/teams/${slug}/memberships/${login}`, {
    method,
    headers: ghHeaders(token),
  })

/**
 * Remove a user from every reserved app-role team. Used before
 * adding them to the new target team so the user never ends up
 * in two app-role teams at once.
 *
 * @param owner org login
 * @param login GitHub login
 * @param token OAuth bearer
 * @returns resolved when all delete requests complete
 */
export const clearReservedTeams = (
  owner: string,
  login: string,
  token: string
): Promise<unknown> =>
  Promise.all(
    (Object.values(TEAM_SLUGS) as readonly string[]).map(slug =>
      teamMembershipOp(owner, slug, login, token, 'DELETE')
    )
  )
