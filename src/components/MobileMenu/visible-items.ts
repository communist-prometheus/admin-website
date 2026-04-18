import type { Role } from '@/types/role'
import type { NavItem } from './nav-items'
import { NAV_ITEMS } from './nav-items'

const ORDER: Record<Role, number> = {
  editor: 0,
  'chief-editor': 1,
  admin: 2,
}

const hasAccess = (item: NavItem, role: Role | undefined): boolean =>
  !item.minRole || (!!role && ORDER[role] >= ORDER[item.minRole])

/**
 * Filter nav items by auth state and role.
 * @param isAuth - Whether user is authenticated
 * @param role - User's resolved role
 * @returns Visible navigation items
 */
export const visibleItems = (
  isAuth: boolean,
  role?: Role
): readonly NavItem[] =>
  NAV_ITEMS.filter(
    item => (!item.requiresAuth || isAuth) && hasAccess(item, role)
  )
