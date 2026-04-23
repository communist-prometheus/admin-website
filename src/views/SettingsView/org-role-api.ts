import { swFetch } from '@/composables/useSWBridge/sw-fetch'

/**
 * Change the app role of a GitHub org member via the SW, which
 * delegates to the matching GitHub teams / membership APIs.
 *
 * @param login GitHub login
 * @param role new app role; 'none' clears team memberships
 */
export const setOrgRole = async (
  login: string,
  role: 'admin' | 'chief-editor' | 'editor' | 'none'
): Promise<void> => {
  await swFetch('/api/github/org-role', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ login, role }),
  })
}
