import type { Role } from '@/types/role'
import type { NavItem } from './nav-items'
import { NAV_ITEMS } from './nav-items'

const ORDER: Record<Role, number> = {
  editor: 0,
  'chief-editor': 1,
  admin: 2,
}

// Role-gated items pass when the item has no minRole, OR when the
// resolved role meets the bar, OR when the role is still unknown
// (mock auth, role-fetch in flight, or transient SW error). Mirror
// the permissive default in `nav-by-role.ts` + `usePermissions`.
const passesRole = (item: NavItem, role: Role | undefined): boolean =>
  !item.minRole || !role || ORDER[role] >= ORDER[item.minRole]

// Owner-only entries pass when the visitor is a known owner OR the
// owner check is still unknown (empty `roles` = mint hasn't returned
// yet, or returned a transient error). Only a positive non-owner
// result hides the entry.
const passesOwner = (item: NavItem, ssoRoles: readonly string[]): boolean =>
  !item.ownerOnly || ssoRoles.length === 0 || ssoRoles.includes('owner')

const passesAuth = (item: NavItem, isAuth: boolean): boolean =>
  !item.requiresAuth || isAuth

/**
 * Filter nav items by auth state, app-role, and SSO roles snapshot.
 * @param isAuth - Whether user is authenticated
 * @param role - User's resolved app role
 * @param ssoRoles - Current SSO roles array from the auth store
 * @returns Visible navigation items
 */
export const visibleItems = (
  isAuth: boolean,
  role: Role | undefined,
  ssoRoles: readonly string[]
): readonly NavItem[] =>
  NAV_ITEMS.filter(
    item =>
      passesAuth(item, isAuth) &&
      passesRole(item, role) &&
      passesOwner(item, ssoRoles)
  )
