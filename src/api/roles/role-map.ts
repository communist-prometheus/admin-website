import type { Role } from '../../types/role'
import { ROLE_HIERARCHY } from '../../types/role'

/** Username → role grants (editor/chief-editor/admin), KV-backed. */
export type RoleMap = Readonly<Record<Role, readonly string[]>>

/** Target of a role assignment — a role, or `none` to clear. */
export type RoleAssignment = Role | 'none'

/** Empty grant map — nobody has an app role yet. */
export const EMPTY_ROLE_MAP: RoleMap = {
  editor: [],
  'chief-editor': [],
  admin: [],
}

/**
 * Case-insensitive GitHub-login equality.
 * @param a - First login.
 * @param b - Second login.
 * @returns True when the logins match ignoring case.
 */
export const sameLogin = (a: string, b: string): boolean =>
  a.toLowerCase() === b.toLowerCase()

/**
 * Highest role whose grant list contains the login (case-insensitive).
 * @param map - The role grant map.
 * @param login - GitHub login to look up.
 * @returns The highest matching role, or undefined.
 */
export const resolveFromMap = (
  map: RoleMap,
  login: string
): Role | undefined =>
  [...ROLE_HIERARCHY]
    .reverse()
    .find(role => map[role].some(u => sameLogin(u, login)))
