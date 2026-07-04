import type { Role } from '@/types/role'
import { NAV_GROUPS, type NavEntry, type NavGroup } from './nav-groups'

const ORDER: Record<Role, number> = {
  editor: 0,
  'chief-editor': 1,
  admin: 2,
}

/*
 * Role-gated entries pass when the entry has no minRole, OR when the
 * resolved role meets the bar, OR when the role is still unknown
 * (mock auth, role-fetch in flight, or transient SW error). Hiding
 * chrome before the role probe completes flickers the nav.
 */
const passesRole = (entry: NavEntry, role: Role | undefined): boolean =>
  !entry.minRole || !role || ORDER[role] >= ORDER[entry.minRole]

/*
 * Owner-only entries pass when the visitor is a known owner OR the
 * owner check is still unknown (empty roles = mint hasn't returned
 * yet). Only a positive non-owner result hides the entry.
 */
const passesOwner = (entry: NavEntry, ssoRoles: readonly string[]): boolean =>
  !entry.ownerOnly || ssoRoles.length === 0 || ssoRoles.includes('owner')

const passes = (
  entry: NavEntry,
  role: Role | undefined,
  ssoRoles: readonly string[]
): boolean => passesRole(entry, role) && passesOwner(entry, ssoRoles)

/**
 * Filter groups + their items by role + owner state. Groups with no
 * surviving items are dropped so consumers can render `v-for` without
 * an empty-heading guard.
 *
 * @param role Current user's app role, or undefined while unresolved.
 * @param ssoRoles Current SSO roles snapshot from the auth store.
 * @returns Nav groups with only the visible entries; empty groups gone.
 */
export const visibleGroups = (
  role: Role | undefined,
  ssoRoles: readonly string[]
): readonly NavGroup[] =>
  NAV_GROUPS.map(g => ({
    title: g.title,
    items: g.items.filter(item => passes(item, role, ssoRoles)),
  })).filter(g => g.items.length > 0)
