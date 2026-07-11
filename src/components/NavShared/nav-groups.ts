import type { NavGroup } from './nav-groups-types'

export type { NavEntry, NavGroup } from './nav-groups-types'

/*
 * Single source of truth for the app navigation. Old desktop
 * (nav-by-role) and mobile (nav-items + owner) lists drifted apart —
 * Labels and Archive existed on desktop but not on mobile. Consolidate
 * here so a change reaches both surfaces.
 *
 * Grouping — Content items editors touch daily; Community for
 * everything that isn't an article (labels, tickets); Distribution
 * for newsletter + feature flags (owner-only); Admin for the Settings
 * sub-router. Home lives outside the groups since it's the "reset"
 * link and doesn't need a category header.
 */
/** Single source of truth for the app-nav: sectioned by group. */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    title: 'Content',
    items: [
      { path: '/content/blog', label: 'Blog' },
      {
        path: '/content/positions',
        label: 'Positions',
        minRole: 'chief-editor',
      },
      { path: '/content/pages', label: 'Pages', minRole: 'admin' },
      { path: '/content/common', label: 'Common', minRole: 'admin' },
      { path: '/content/magazine', label: 'Magazine' },
      { path: '/content/archive', label: 'Archive' },
    ],
  },
  {
    title: 'Community',
    items: [
      { path: '/labels', label: 'Labels' },
      { path: '/tickets', label: 'Tickets' },
    ],
  },
  {
    title: 'Distribution',
    items: [
      {
        path: '/comms',
        label: 'Newsletter',
        labelKey: 'nav.comms',
        ownerOnly: true,
      },
      {
        path: '/features',
        label: 'Features',
        labelKey: 'nav.features',
        ownerOnly: true,
      },
    ],
  },
  {
    title: 'Admin',
    items: [{ path: '/settings', label: 'Settings', minRole: 'admin' }],
  },
]
