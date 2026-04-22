import { Schema } from 'effect'
import type { Role } from '@/types/role'
import { ROLE_HIERARCHY } from '@/types/role'
import { RolesConfigSchema } from '@/validation/schemas/roles'
import { readRepoFile } from '../git/io/read-file'
import { log } from '../logging/logger'
import { isOrgAdmin } from './org-admin-cache'

const ROLES_PATH = '.admin/roles.json'

let cachedRoles: typeof RolesConfigSchema.Type | undefined

/** Clear cached roles (call after repo sync) */
export const invalidateRoles = (): void => {
  cachedRoles = undefined
}

/** Load roles config from the cloned repo */
export const loadRoles = async (): Promise<void> => {
  try {
    const raw = await readRepoFile(ROLES_PATH)
    const json: unknown = JSON.parse(raw)
    cachedRoles = Schema.decodeUnknownSync(RolesConfigSchema)(json)
    log('info', 'rbac', 'roles loaded')
  } catch {
    cachedRoles = undefined
    log('warn', 'rbac', 'roles.json not found or invalid')
  }
}

/**
 * Resolve the role for a given GitHub username.
 * @param username - GitHub login
 * @returns Highest matching role or undefined
 */
export const resolveRole = (username: string): Role | undefined => {
  if (isOrgAdmin(username)) return 'admin'
  if (!cachedRoles) return undefined
  const { roles } = cachedRoles
  for (let i = ROLE_HIERARCHY.length - 1; i >= 0; i--) {
    const role = ROLE_HIERARCHY[i]
    if (roles[role].includes(username)) return role
  }
  return undefined
}
