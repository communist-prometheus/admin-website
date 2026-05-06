import type { ContentItem } from '@/types/content'

/**
 * Coerce a frontmatter date-like value to an epoch ms.
 * Strings (`YAML 1.2` keeps `YYYY-MM-DD` as strings) and `Date`
 * instances are accepted; anything unparseable becomes `undefined`
 * so callers can sink it to the bottom.
 * @param value - Raw frontmatter field value
 * @returns Epoch ms or `undefined` when invalid/missing
 */
const toEpoch = (value: unknown): number | undefined => {
  const date =
    value instanceof Date
      ? value
      : typeof value === 'string'
        ? new Date(value)
        : undefined
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : undefined
}

/**
 * Read the publish date from a content item, accepting the legacy
 * `pubDate` field as a fallback for older content.
 * @param item - Content item
 * @returns Epoch ms or `undefined`
 */
const itemEpoch = (item: ContentItem): number | undefined =>
  toEpoch(item.frontmatter.publishDate) ?? toEpoch(item.frontmatter.pubDate)

/**
 * Comparator: newer publishDate first. Items missing/invalid date
 * sink to the bottom; ties break alphabetically by slug.
 * @param a - Left item
 * @param b - Right item
 * @returns Standard comparator result
 */
const compareNewestFirst = (a: ContentItem, b: ContentItem): number => {
  const ea = itemEpoch(a)
  const eb = itemEpoch(b)
  const dateOrder =
    ea === eb ? 0 : ea === undefined ? 1 : eb === undefined ? -1 : eb - ea
  return dateOrder === 0 ? a.slug.localeCompare(b.slug) : dateOrder
}

/**
 * Return a new array sorted newest-first by `publishDate` (with
 * `pubDate` legacy fallback). Items without a valid date sink to
 * the bottom and tie-break alphabetically by slug.
 * @param items - Content items in any order
 * @returns New array, newest-first
 */
export const sortByDateNewestFirst = (
  items: readonly ContentItem[]
): readonly ContentItem[] => [...items].sort(compareNewestFirst)
