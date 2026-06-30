import { type RoleAssignment, type RoleMap, sameLogin } from './role-map'

const without = (list: readonly string[], login: string): readonly string[] =>
  list.filter(u => !sameLogin(u, login))

const stripLogin = (map: RoleMap, login: string): RoleMap => ({
  editor: without(map.editor, login),
  'chief-editor': without(map['chief-editor'], login),
  admin: without(map.admin, login),
})

/**
 * Reassign a login: removed from every list, then added to `role`
 * (unless `none`). Pure — returns a new map.
 * @param map - Current role map.
 * @param login - GitHub login to (re)assign.
 * @param role - Target role, or `none` to clear.
 * @returns Updated role map.
 */
export const applyRole = (
  map: RoleMap,
  login: string,
  role: RoleAssignment
): RoleMap => {
  const cleared = stripLogin(map, login)
  return role === 'none'
    ? cleared
    : { ...cleared, [role]: [...cleared[role], login] }
}
