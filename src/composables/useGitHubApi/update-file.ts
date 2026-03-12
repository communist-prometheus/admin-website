import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { UpdateFileParams } from './types'

/**
 * Update file in GitHub repository.
 * @param params - File update parameters
 * @returns Update result
 */
export const updateFile = async (
  params: UpdateFileParams
): Promise<{ readonly success: boolean }> => {
  const res = await swFetch('/api/github/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return res.json() as Promise<{ readonly success: boolean }>
}
