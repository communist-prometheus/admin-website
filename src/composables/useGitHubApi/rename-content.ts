import { swFetch } from '@/composables/useSWBridge/sw-fetch'

/**
 * Rename a content slug via the SW BFF.
 * @param type - Content type (blog, pages, positions)
 * @param oldSlug - Current slug
 * @param newSlug - New slug
 * @returns Parsed response data
 */
export const renameContent = async (
  type: string,
  oldSlug: string,
  newSlug: string
): Promise<{ readonly success: boolean; readonly count: number }> => {
  const res = await swFetch('/api/github/content/rename', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, oldSlug, newSlug }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Rename failed')
  }
  return res.json()
}
