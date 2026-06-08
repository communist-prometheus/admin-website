import type { Role } from '@/types/role'

/** Navigation item definition for mobile menu. */
export interface NavItem {
  readonly path: string
  /** Hardcoded label (used when no `labelKey` is present). */
  readonly label: string
  /** Dotted i18n key — when present, resolved via `t()` at render. */
  readonly labelKey?: string
  readonly requiresAuth: boolean
  readonly minRole?: Role
  readonly ownerOnly?: boolean
}

/** Shared navigation items used by mobile menu. */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'Home', requiresAuth: false },
  { path: '/content/blog', label: 'Blog', requiresAuth: true },
  // prettier-ignore
  {
    path: '/content/positions',
    label: 'Positions',
    requiresAuth: true,
    minRole: 'chief-editor',
  },
  // prettier-ignore
  {
    path: '/content/pages',
    label: 'Pages',
    requiresAuth: true,
    minRole: 'admin',
  },
  // prettier-ignore
  {
    path: '/content/common',
    label: 'Common',
    requiresAuth: true,
    minRole: 'admin',
  },
  { path: '/content/newspaper', label: 'Newspaper', requiresAuth: true },
  { path: '/tickets', label: 'Tickets', requiresAuth: true },
  // prettier-ignore
  {
    path: '/comms',
    label: 'Newsletter',
    labelKey: 'nav.comms',
    requiresAuth: true,
    ownerOnly: true,
  },
  // prettier-ignore
  {
    path: '/settings',
    label: 'Settings',
    requiresAuth: true,
    minRole: 'admin',
  },
]
