import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { InviteRequest } from './roles-api-types'

/**
 * Create a pending GitHub org invitation with the requested app
 * role. Accepts either email or login.
 *
 * @param req invite payload
 * @returns id of the created invitation or undefined on failure
 */
export const createInvite = async (
  req: InviteRequest
): Promise<number | undefined> => {
  const res = await swFetch('/api/github/org-invite', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req),
  })
  return res.ok
    ? ((await res.json()) as { readonly id: number }).id
    : undefined
}

/**
 * Revoke a pending invitation by id.
 *
 * @param id invitation id
 * @returns true on success
 */
export const revokeInvite = async (id: number): Promise<boolean> => {
  const res = await swFetch(`/api/github/org-invite/${id}`, {
    method: 'DELETE',
  })
  return res.ok
}
