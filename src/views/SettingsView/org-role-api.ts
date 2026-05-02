import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { okOrThrow } from './sw-response'

/**
 * Change the app role of a GitHub org member via the SW, which
 * delegates to the matching GitHub teams / membership APIs.
 *
 * Wrapped in `okOrThrow` so a non-OK response from the SW or GH
 * surfaces as a thrown error — without this, every role-change
 * request silently "succeeds", the row reloads with the previous
 * role still in place, and the editor sees no effect (per
 * feedback_silent_failures_in_rbac.md).
 *
 * @param login GitHub login.
 * @param role new app role; 'none' clears team memberships.
 */
export const setOrgRole = async (
  login: string,
  role: 'admin' | 'chief-editor' | 'editor' | 'none'
): Promise<void> => {
  await okOrThrow(
    await swFetch('/api/github/org-role', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ login, role }),
    })
  )
}
