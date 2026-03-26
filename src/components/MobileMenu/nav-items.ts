/** Navigation item definition for mobile menu. */
export interface NavItem {
  readonly path: string
  readonly label: string
  readonly requiresAuth: boolean
}

/** Shared navigation items used by mobile menu. */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'Home', requiresAuth: false },
  { path: '/content/blog', label: 'Blog', requiresAuth: true },
  {
    path: '/content/positions',
    label: 'Positions',
    requiresAuth: true,
  },
  {
    path: '/content/pages',
    label: 'Pages',
    requiresAuth: true,
  },
  {
    path: '/content/common',
    label: 'Common',
    requiresAuth: true,
  },
  {
    path: '/settings',
    label: 'Settings',
    requiresAuth: true,
  },
]
