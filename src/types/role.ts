/** Available user roles in the admin panel */
export type Role = 'editor' | 'chief-editor' | 'admin'

/** Role hierarchy — higher index = more permissions */
export const ROLE_HIERARCHY: readonly Role[] = [
  'editor',
  'chief-editor',
  'admin',
]

/** Roles configuration stored in .admin/roles.json */
export interface RolesConfig {
  readonly roles: Readonly<Record<Role, readonly string[]>>
}
