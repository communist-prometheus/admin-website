import { API, ghJson } from './github-api'
import { setOrgAdmins } from './org-admin-cache'
import type { OrgMember } from './org-members-types'

interface RawMember {
  readonly login: string
  readonly avatar_url?: string
}

const fetchRole = async (
  owner: string,
  token: string,
  role: 'admin' | 'member'
): Promise<readonly RawMember[]> => {
  const j = await ghJson<unknown>(
    `${API}/orgs/${owner}/members?role=${role}&per_page=100`,
    token
  )
  return Array.isArray(j) ? (j as RawMember[]) : []
}

const tag = (
  xs: readonly RawMember[],
  orgRole: OrgMember['orgRole']
): readonly OrgMember[] =>
  xs.map(m => ({ login: m.login, orgRole, avatarUrl: m.avatar_url }))

/**
 * Load every GitHub-org member (admin + regular), tag each with
 * their org role and public avatar URL, and refresh the SW
 * org-admin cache.
 *
 * @param owner org login
 * @param token OAuth bearer with read:org
 * @returns org members sorted by login
 */
export const loadOrgMembers = async (
  owner: string,
  token: string
): Promise<readonly OrgMember[]> => {
  const [admins, members] = await Promise.all([
    fetchRole(owner, token, 'admin'),
    fetchRole(owner, token, 'member'),
  ])
  setOrgAdmins(admins.map(a => a.login))
  return [...tag(admins, 'admin'), ...tag(members, 'member')]
}
