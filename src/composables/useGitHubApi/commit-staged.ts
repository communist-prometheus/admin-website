import { swFetch } from '@/composables/useSWBridge/sw-fetch'

/**
 * Commit all staged changes and push to remote.
 * @param message - Commit message
 * @returns Commit SHA
 */
export const commitStaged = async (
  message: string
): Promise<{ success: boolean; sha: string }> => {
  const res = await swFetch('/api/github/commit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  return res.json() as Promise<{ success: boolean; sha: string }>
}
