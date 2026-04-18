import type { Role } from '@/types/role'

/** Navigation item definition for mobile menu. */
export interface NavItem {
  readonly path: string
  readonly label: string
  readonly requiresAuth: boolean
  readonly minRole?: Role
}

/** Shared navigation items used by mobile menu. */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'Home', requiresAuth: false },
  { path: '/content/blog', label: 'Blog', requiresAuth: true },
  {
    path: '/content/positions',
    label: 'Positions',
    requiresAuth: true,
    minRole: 'chief-editor',
  },
  {
    path: '/content/pages',
    label: 'Pages',
    requiresAuth: true,
    minRole: 'admin',
  },
  {
    path: '/content/common',
    label: 'Common',
    requiresAuth: true,
    minRole: 'admin',
  },
  {
    path: '/content/newspaper',
    label: 'Newspaper',
    requiresAuth: true,
  },
  {
    path: '/tickets',
    label: 'Tickets',
    requiresAuth: true,
  },
  {
    path: '/settings',
    label: 'Settings',
    requiresAuth: true,
    minRole: 'admin',
  },
]
