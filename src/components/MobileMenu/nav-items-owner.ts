import type { NavItem } from './nav-items-types'

/** Owner-only nav entries — appended after the core list. */
export const OWNER_NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    path: '/comms',
    label: 'Newsletter',
    labelKey: 'nav.comms',
    requiresAuth: true,
    ownerOnly: true,
  },
  {
    path: '/features',
    label: 'Features',
    labelKey: 'nav.features',
    requiresAuth: true,
    ownerOnly: true,
  },
]
