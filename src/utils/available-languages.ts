import type { ContentItem, Language } from '@/types/content'

/**
 * Collects the set of languages that exist for a given slug
 * @param items - Content items to search
 * @param slug - Document slug to filter by
 * @returns Set of languages that have content for the slug
 */
export const getAvailableLanguages = (
  items: readonly ContentItem[],
  slug: string
): ReadonlySet<Language> =>
  new Set(items.filter(item => item.slug === slug).map(item => item.lang))
