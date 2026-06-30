import type { RolesKv } from './kv-types'
import { EMPTY_ROLE_MAP, type RoleMap } from './role-map'

const KEY = 'roles'

/**
 * Read the role grant map from KV. Missing value or unbound namespace
 * resolves to an empty map (no app roles granted).
 * @param kv - The ROLES_KV namespace binding (optional in local dev).
 * @returns The stored role map, or an empty map.
 */
export const readRoles = async (
  kv: RolesKv | undefined
): Promise<RoleMap> => {
  const stored = await kv?.get<RoleMap>(KEY, 'json')
  return stored ?? EMPTY_ROLE_MAP
}

/**
 * Persist the role grant map to KV.
 * @param kv - The ROLES_KV namespace binding.
 * @param map - The map to store.
 */
export const writeRoles = async (
  kv: RolesKv,
  map: RoleMap
): Promise<void> => {
  await kv.put(KEY, JSON.stringify(map))
}
