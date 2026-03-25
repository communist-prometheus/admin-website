import type { NavItem } from './nav-items'
import { NAV_ITEMS } from './nav-items'

/**
 * Filter nav items by authentication state.
 * @param isAuth - Whether user is authenticated
 * @returns Visible navigation items
 */
export const visibleItems = (isAuth: boolean): readonly NavItem[] =>
  NAV_ITEMS.filter(item => !item.requiresAuth || isAuth)
