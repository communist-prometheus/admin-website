import type { Role, RolesConfig } from '@/types/role'

const ROLES: readonly Role[] = ['admin', 'chief-editor', 'editor']

const without = (list: readonly string[], login: string): readonly string[] =>
  list.filter(u => u.toLowerCase() !== login.toLowerCase())

/**
 * Apply a role change to the current roles config in a pure way.
 * `role === undefined` removes the user from every role bucket
 * (turning the row into "no role"). Otherwise the user is added to
 * the target bucket and removed from the others.
 *
 * @param config current roles.json content
 * @param login GitHub login to modify
 * @param role target role, or undefined to clear
 * @returns new config object
 */
export const applyRoleChange = (
  config: RolesConfig,
  login: string,
  role: Role | undefined
): RolesConfig => {
  const next: Record<Role, readonly string[]> = {
    admin: without(config.roles.admin, login),
    'chief-editor': without(config.roles['chief-editor'], login),
    editor: without(config.roles.editor, login),
  }
  if (role && ROLES.includes(role)) {
    next[role] = [...next[role], login]
  }
  return { roles: next }
}
