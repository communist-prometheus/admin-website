import { Schema } from 'effect'
import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { ContentItem, ContentType } from '@/types/content'
import type { ContentItemRaw } from '@/validation/schemas/content-item'
import { ContentListResponseSchema } from '@/validation/schemas/content-item'

/** All content types to load */
export const CONTENT_TYPES: readonly ContentType[] = [
  'blog',
  'pages',
  'positions',
  'common',
]

/**
 * Map a raw validated content item to a ContentItem.
 * @param item - Raw content item from schema validation
 * @returns Mapped content item
 */
const toContentItem = (item: ContentItemRaw): ContentItem => ({
  path: item.path,
  slug: item.slug,
  lang: String(item.frontmatter.lang ?? ''),
  frontmatter: item.frontmatter,
})

/**
 * Fetch content items of a given type from the SW.
 * Waits for SW readiness before issuing the request.
 * @param type - Content type to fetch
 * @returns Array of content items
 */
export const fetchContentItems = async (
  type: ContentType
): Promise<readonly ContentItem[]> => {
  if (typeof globalThis.document === 'undefined') return []
  const response = await swFetch(`/api/github/content/${type}`)
  if (!response.ok) {
    throw new Error(`Failed to load: ${response.statusText}`)
  }
  const json: unknown = await response.json()
  const data = Schema.decodeUnknownSync(ContentListResponseSchema)(json)
  return data.items.map(toContentItem)
}
