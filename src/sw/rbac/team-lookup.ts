import { Option } from 'effect'
import { API, ghJson } from './github-api'
import { TEAM_SLUGS, type TeamRole } from './team-slugs'

interface TeamRef {
  readonly id: number
  readonly slug: string
}

const asTeamRole = (role: string): TeamRole | undefined =>
  role === 'editor' || role === 'chief-editor' ? role : undefined

/**
 * Resolve the numeric GitHub team id for the app role's reserved
 * team slug, or return an empty list when the role maps to the
 * org (admin) or the team is missing.
 *
 * @param owner org login
 * @param token OAuth bearer
 * @param role app role
 * @returns list with 0 or 1 team id
 */
export const teamIdsFor = async (
  owner: string,
  token: string,
  role: 'admin' | 'chief-editor' | 'editor'
): Promise<readonly number[]> =>
  Option.match(Option.fromNullable(asTeamRole(role)), {
    onNone: () => Promise.resolve<readonly number[]>([]),
    onSome: async tr => {
      const teams = await ghJson<readonly TeamRef[]>(
        `${API}/orgs/${owner}/teams?per_page=100`,
        token
      ).catch(() => [])
      const slug = TEAM_SLUGS[tr]
      const found = teams.find(t => t.slug === slug)
      return found ? [found.id] : []
    },
  })
