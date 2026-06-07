import type { Role } from '@/types/role'
import type { NavItem } from './nav-items'
import { NAV_ITEMS } from './nav-items'

const ORDER: Record<Role, number> = {
  editor: 0,
  'chief-editor': 1,
  admin: 2,
}

const passesRole = (item: NavItem, role: Role | undefined): boolean =>
  !item.minRole || (!!role && ORDER[role] >= ORDER[item.minRole])

const passesOwner = (item: NavItem, isOwner: boolean): boolean =>
  !item.ownerOnly || isOwner

const passesAuth = (item: NavItem, isAuth: boolean): boolean =>
  !item.requiresAuth || isAuth

/**
 * Filter nav items by auth state, app-role, and SSO owner flag.
 * @param isAuth - Whether user is authenticated
 * @param role - User's resolved app role
 * @param isOwner - Whether the SSO session carries the owner claim
 * @returns Visible navigation items
 */
export const visibleItems = (
  isAuth: boolean,
  role: Role | undefined,
  isOwner: boolean
): readonly NavItem[] =>
  NAV_ITEMS.filter(
    item =>
      passesAuth(item, isAuth) &&
      passesRole(item, role) &&
      passesOwner(item, isOwner)
  )
