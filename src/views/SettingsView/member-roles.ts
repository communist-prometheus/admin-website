import { ROLE_HIERARCHY } from '@/types/role'
import type { RoleMap } from './role-store-api'
import type { OrgMember } from './roles-api-types'

const roleFor = (map: RoleMap, login: string): OrgMember['appRole'] =>
  [...ROLE_HIERARCHY]
    .reverse()
    .find(r => map[r].some(u => u.toLowerCase() === login.toLowerCase()))

/**
 * Overlay KV-backed app roles onto org members. Org admins stay
 * `admin`; everyone else reflects their KV grant (or none). When the
 * map is undefined (fetch failed / non-admin viewer / mock) the
 * server-provided roles are kept untouched.
 * @param members - Members from the org-members endpoint.
 * @param map - The KV role map, or undefined.
 * @returns Members whose appRole reflects the KV store.
 */
export const overlayRoles = (
  members: readonly OrgMember[],
  map: RoleMap | undefined
): readonly OrgMember[] =>
  map === undefined
    ? members
    : members.map(m => ({
        ...m,
        appRole: m.orgRole === 'admin' ? 'admin' : roleFor(map, m.login),
      }))
