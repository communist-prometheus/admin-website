import { OWNER_NAV_ITEMS } from './nav-items-owner'
import type { NavItem } from './nav-items-types'

export type { NavItem } from './nav-items-types'

const CORE: ReadonlyArray<NavItem> = [
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
  { path: '/content/newspaper', label: 'Newspaper', requiresAuth: true },
  { path: '/tickets', label: 'Tickets', requiresAuth: true },
]

const TAIL: ReadonlyArray<NavItem> = [
  {
    path: '/settings',
    label: 'Settings',
    requiresAuth: true,
    minRole: 'admin',
  },
]

/** Shared navigation items used by mobile menu. */
export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  ...CORE,
  ...OWNER_NAV_ITEMS,
  ...TAIL,
]
