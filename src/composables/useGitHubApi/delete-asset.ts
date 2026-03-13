import { swFetch } from '@/composables/useSWBridge/sw-fetch'

/**
 * Delete an asset file from the SW virtual FS.
 * @param path - Asset file path to delete
 * @returns Success response
 */
export const deleteAsset = async (
  path: string
): Promise<{ success: boolean }> => {
  const res = await swFetch('/api/github/asset', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path }),
  })
  return res.json() as Promise<{ success: boolean }>
}
