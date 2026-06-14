import type { ContentItem } from '@/types/content'

/** An archive item available to attach to an article or position. */
export interface ArchiveOption {
  readonly slug: string
  readonly title: string
}

const titleFromFrontmatter = (fm: ContentItem['frontmatter']): string => {
  const t = fm['title']
  return typeof t === 'string' && t.trim() !== '' ? t : ''
}

const candidateFor = (item: ContentItem): ArchiveOption => ({
  slug: item.slug,
  title: titleFromFrontmatter(item.frontmatter) || item.slug,
})

const shouldOverwrite = (
  existing: ArchiveOption | undefined,
  candidate: ArchiveOption
): boolean =>
  existing === undefined ||
  (existing.title === existing.slug && candidate.title !== candidate.slug)

const accumulate = (
  acc: Map<string, ArchiveOption>,
  item: ContentItem
): Map<string, ArchiveOption> => {
  const candidate = candidateFor(item)
  return shouldOverwrite(acc.get(item.slug), candidate)
    ? acc.set(item.slug, candidate)
    : acc
}

/**
 * Reduce the archive content store to a deduped, alphabetised list of
 * items with the best human-readable title from any language-specific
 * frontmatter. The blog/positions picker uses this so editors attach
 * an archive from the same set the public widget will render.
 *
 * @param items All archive ContentItems from the store.
 * @returns Alphabetised available archive items.
 */
export const archiveOptions = (
  items: readonly ContentItem[]
): readonly ArchiveOption[] => {
  const bySlug = items.reduce<Map<string, ArchiveOption>>(
    accumulate,
    new Map()
  )
  return [...bySlug.values()].sort((a, b) => a.title.localeCompare(b.title))
}
