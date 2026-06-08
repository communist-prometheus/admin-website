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
