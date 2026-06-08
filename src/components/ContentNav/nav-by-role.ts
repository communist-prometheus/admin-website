import type { Role } from '@/types/role'

interface NavEntry {
  readonly path: string
  readonly label: string
  readonly minRole?: Role
  readonly ownerOnly?: boolean
}

const ALL_NAV: readonly NavEntry[] = [
  { path: '/content/blog', label: 'Blog' },
  { path: '/content/positions', label: 'Positions', minRole: 'chief-editor' },
  { path: '/content/pages', label: 'Pages', minRole: 'admin' },
  { path: '/content/common', label: 'Common', minRole: 'admin' },
  { path: '/content/newspaper', label: 'Newspaper' },
  { path: '/tickets', label: 'Tickets' },
  { path: '/comms', label: 'Рассылка', ownerOnly: true },
  { path: '/settings', label: 'Settings', minRole: 'admin' },
]

const ORDER: Record<Role, number> = {
  editor: 0,
  'chief-editor': 1,
  admin: 2,
}

const passesRole = (entry: NavEntry, role: Role | undefined): boolean =>
  !entry.minRole || (!!role && ORDER[role] >= ORDER[entry.minRole])

// Owner-only entries pass when the visitor is a known owner OR the
// owner check is still unknown (empty `roles` = mint hasn't returned
// yet, or returned a transient error). Only a positive non-owner
// result hides the entry.
const passesOwner = (entry: NavEntry, ssoRoles: readonly string[]): boolean =>
  !entry.ownerOnly || ssoRoles.length === 0 || ssoRoles.includes('owner')

/**
 * Filter nav items by app-role + SSO owner state.
 * @param role - Current user role (undefined = show all role-gated entries)
 * @param ssoRoles - Current SSO roles array from the auth store
 * @returns Visible nav items
 */
export const getNavForRole = (
  role: Role | undefined,
  ssoRoles: readonly string[]
): readonly NavEntry[] =>
  ALL_NAV.filter(n => passesRole(n, role) && passesOwner(n, ssoRoles))
