import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { InviteRequest } from './roles-api-types'
import { okOrThrow } from './sw-response'

/**
 * Create a pending GitHub org invitation with the requested app
 * role. Accepts either email or login. Throws when the SW or
 * GitHub returned a non-OK status so the dialog surfaces the real
 * reason instead of silently closing on failure.
 *
 * @param req - Invite payload
 * @returns Id of the created invitation
 */
export const createInvite = async (req: InviteRequest): Promise<number> => {
  const res = await okOrThrow(
    await swFetch('/api/github/org-invite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req),
    })
  )
  return ((await res.json()) as { readonly id: number }).id
}

/**
 * Revoke a pending invitation by id. Throws on non-OK.
 *
 * @param id - Invitation id
 */
export const revokeInvite = async (id: number): Promise<void> => {
  await okOrThrow(
    await swFetch(`/api/github/org-invite/${id}`, { method: 'DELETE' })
  )
}
