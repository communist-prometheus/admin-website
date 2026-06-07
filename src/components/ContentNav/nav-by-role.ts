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
  { path: '/comms', label: 'Comms', ownerOnly: true },
  { path: '/settings', label: 'Settings', minRole: 'admin' },
]

const ORDER: Record<Role, number> = {
  editor: 0,
  'chief-editor': 1,
  admin: 2,
}

const passesRole = (entry: NavEntry, role: Role | undefined): boolean =>
  !entry.minRole || (!!role && ORDER[role] >= ORDER[entry.minRole])

const passesOwner = (entry: NavEntry, isOwner: boolean): boolean =>
  !entry.ownerOnly || isOwner

/**
 * Filter nav items by app-role + SSO owner flag.
 * @param role - Current user role (undefined = show all role-gated entries)
 * @param isOwner - Whether the current SSO session carries the owner claim
 * @returns Visible nav items
 */
export const getNavForRole = (
  role: Role | undefined,
  isOwner: boolean
): readonly NavEntry[] =>
  ALL_NAV.filter(n => passesRole(n, role) && passesOwner(n, isOwner))
