import { swFetch } from '@/composables/useSWBridge/sw-fetch'

/**
 * Write + stage a file without committing.
 * @param path - File path
 * @param content - File content string
 * @returns Success response
 */
export const stageFile = async (
  path: string,
  content: string
): Promise<{ success: boolean }> => {
  const res = await swFetch('/api/github/file/stage', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path, content }),
  })
  return res.json() as Promise<{ success: boolean }>
}
