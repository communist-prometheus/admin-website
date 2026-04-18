import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { Role } from '@/types/role'

interface RoleResponse {
  readonly role?: Role
  readonly username?: string
}

/**
 * Fetch the current user's role from the SW.
 * @returns Resolved role or undefined
 */
export const fetchRole = async (): Promise<Role | undefined> => {
  try {
    const response = await swFetch('/api/github/role')
    if (!response.ok) return undefined
    const data = (await response.json()) as RoleResponse
    return data.role
  } catch {
    return undefined
  }
}
