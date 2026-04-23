import { API, ghJson } from './github-api'
import { TEAM_SLUGS, type TeamRole } from './team-slugs'

interface RawMember {
  readonly login: string
}

const listTeam = async (
  owner: string,
  slug: string,
  token: string
): Promise<readonly string[]> => {
  const url = `${API}/orgs/${owner}/teams/${slug}/members?per_page=100`
  const json = await ghJson<unknown>(url, token).catch(() => [])
  return Array.isArray(json) ? (json as RawMember[]).map(m => m.login) : []
}

/**
 * Fetch the set of logins that belong to each reserved team on the
 * org. Missing teams are reported as empty sets rather than failing
 * the whole members payload.
 *
 * @param owner org login
 * @param token OAuth bearer with read:org
 * @returns map from team role to lower-cased login set
 */
export const loadTeamMembers = async (
  owner: string,
  token: string
): Promise<Readonly<Record<TeamRole, ReadonlySet<string>>>> => {
  const pairs = await Promise.all(
    (Object.keys(TEAM_SLUGS) as readonly TeamRole[]).map(async role => {
      const logins = await listTeam(owner, TEAM_SLUGS[role], token)
      return [role, new Set(logins.map(l => l.toLowerCase()))] as const
    })
  )
  const seed: Record<TeamRole, ReadonlySet<string>> = {
    'chief-editor': new Set<string>(),
    editor: new Set<string>(),
  }
  pairs.forEach(([role, set]) => {
    seed[role] = set
  })
  return seed
}
