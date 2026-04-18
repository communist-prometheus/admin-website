import type { Role } from '@/types/role'

interface NavEntry {
  readonly path: string
  readonly label: string
  readonly minRole?: Role
}

const ALL_NAV: readonly NavEntry[] = [
  { path: '/content/blog', label: 'Blog' },
  { path: '/content/positions', label: 'Positions', minRole: 'chief-editor' },
  { path: '/content/pages', label: 'Pages', minRole: 'admin' },
  { path: '/content/common', label: 'Common', minRole: 'admin' },
  { path: '/content/newspaper', label: 'Newspaper' },
  { path: '/tickets', label: 'Tickets' },
  { path: '/settings', label: 'Settings', minRole: 'admin' },
]

const ORDER: Record<Role, number> = {
  editor: 0,
  'chief-editor': 1,
  admin: 2,
}

/**
 * Filter nav items by role.
 * @param role - Current user role (undefined = show all)
 * @returns Visible nav items
 */
export const getNavForRole = (role: Role | undefined) =>
  role
    ? ALL_NAV.filter(n => !n.minRole || ORDER[role] >= ORDER[n.minRole])
    : ALL_NAV
