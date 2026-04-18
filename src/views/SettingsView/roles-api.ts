import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { RolesConfig } from '@/types/role'

/**
 * Fetch the full roles config from the SW.
 * @returns Roles config or default empty config
 */
export const fetchRolesConfig = async (): Promise<RolesConfig> => {
  const res = await swFetch('/api/github/roles')
  if (!res.ok) return { roles: { editor: [], 'chief-editor': [], admin: [] } }
  return (await res.json()) as RolesConfig
}

/**
 * Save updated roles config to the SW.
 * @param config - Updated roles config
 */
export const saveRolesConfig = async (config: RolesConfig): Promise<void> => {
  await swFetch('/api/github/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
}
