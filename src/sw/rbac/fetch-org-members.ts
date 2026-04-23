import { setOrgAdmins } from './org-admin-cache'
import type { OrgMember } from './org-members-types'

interface RawMember {
  readonly login: string
}

const fetchRole = async (
  owner: string,
  token: string,
  role: 'admin' | 'member'
): Promise<readonly string[]> => {
  const url = `https://api.github.com/orgs/${owner}/members?role=${role}&per_page=100`
  const res = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
    },
  })
  if (!res.ok) throw new Error(`github ${res.status}`)
  const json: unknown = await res.json()
  return Array.isArray(json) ? (json as RawMember[]).map(m => m.login) : []
}

const tag = (
  logins: readonly string[],
  orgRole: OrgMember['orgRole']
): readonly OrgMember[] => logins.map(login => ({ login, orgRole }))

/**
 * Load every GitHub-org member by making parallel calls for admin
 * and member roles, then tag each login with its org role. Refresh
 * the SW org-admin cache as a side-effect so resolveRole() can
 * promote org admins to implicit app-admins.
 *
 * @param owner GitHub org login
 * @param token OAuth bearer token with `read:org`
 * @returns tagged union of admins first, then regular members
 */
export const loadOrgMembers = async (
  owner: string,
  token: string
): Promise<readonly OrgMember[]> => {
  const [admins, members] = await Promise.all([
    fetchRole(owner, token, 'admin'),
    fetchRole(owner, token, 'member'),
  ])
  setOrgAdmins(admins)
  return [...tag(admins, 'admin'), ...tag(members, 'member')]
}
