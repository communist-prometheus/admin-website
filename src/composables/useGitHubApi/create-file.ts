import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { CreateFileParams } from './types'

/**
 * Create file in GitHub repository.
 * @param params - File creation parameters
 * @returns File creation result
 */
export const createFile = async (
  params: CreateFileParams
): Promise<{ readonly success: boolean }> => {
  const res = await swFetch('/api/github/file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return res.json() as Promise<{ readonly success: boolean }>
}
