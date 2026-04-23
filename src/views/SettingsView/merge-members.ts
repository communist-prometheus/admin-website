import type { Role, RolesConfig } from '@/types/role'
import type { OrgMember } from './roles-api'

/** A single row rendered in the Members section. */
export interface MemberRow {
  readonly login: string
  readonly orgRole: 'admin' | 'member'
  readonly appRole: Role | undefined
}

const ROLE_ORDER: readonly Role[] = ['admin', 'chief-editor', 'editor']

const findAppRole = (
  config: RolesConfig,
  login: string
): Role | undefined => {
  const lower = login.toLowerCase()
  for (const r of ROLE_ORDER) {
    if (config.roles[r].some(u => u.toLowerCase() === lower)) return r
  }
  return undefined
}

const byAppThenOrg = (a: MemberRow, b: MemberRow): number => {
  const ai = a.appRole ? ROLE_ORDER.indexOf(a.appRole) : ROLE_ORDER.length
  const bi = b.appRole ? ROLE_ORDER.indexOf(b.appRole) : ROLE_ORDER.length
  if (ai !== bi) return ai - bi
  if (a.orgRole !== b.orgRole) return a.orgRole === 'admin' ? -1 : 1
  return a.login.localeCompare(b.login)
}

/**
 * Merge GitHub-org members with the roles.json config so every row
 * shows the member's org role plus their assigned app role (if
 * any). Rows are ordered: admins → chief-editors → editors →
 * unassigned; within each bucket org admins first, then
 * alphabetical.
 *
 * @param members list of org members returned by the SW
 * @param config current roles.json content
 * @returns sorted list of merged rows
 */
export const mergeMembers = (
  members: readonly OrgMember[],
  config: RolesConfig
): readonly MemberRow[] =>
  members
    .map(m => ({
      login: m.login,
      orgRole: m.orgRole,
      appRole: findAppRole(config, m.login),
    }))
    .slice()
    .sort(byAppThenOrg)
