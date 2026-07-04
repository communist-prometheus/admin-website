import type { Role } from '@/types/role'

/** Navigation entry shared by desktop and mobile menus. */
export interface NavEntry {
  readonly path: string
  /** Hardcoded label (used when no `labelKey` is present). */
  readonly label: string
  /** Dotted i18n key — when present, resolved via `t()` at render. */
  readonly labelKey?: string
  readonly minRole?: Role
  readonly ownerOnly?: boolean
}

/** A titled group of nav entries — rendered as a section on mobile,
 *  and as a `border-inline-start`-separated cluster on desktop. */
export interface NavGroup {
  readonly title: string
  readonly items: readonly NavEntry[]
}
