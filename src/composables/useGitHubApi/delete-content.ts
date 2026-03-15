import { swFetch } from '@/composables/useSWBridge/sw-fetch'

/**
 * Delete ALL language versions of a slug.
 * @param type - Content type
 * @param slug - Content slug
 */
export const deleteAllVersions = async (
  type: string,
  slug: string
): Promise<void> => {
  const res = await swFetch(`/api/github/content/${type}/${slug}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Delete failed')
  }
}

/**
 * Delete a single language version of a slug.
 * @param type - Content type
 * @param slug - Content slug
 * @param lang - Language code
 */
export const deleteSingleVersion = async (
  type: string,
  slug: string,
  lang: string
): Promise<void> => {
  const res = await swFetch(`/api/github/content/${type}/${slug}/${lang}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Delete failed')
  }
}
