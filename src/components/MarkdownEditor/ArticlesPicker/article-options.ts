import type { ContentItem } from '@/types/content'

/** A blog article available to be linked into a newspaper issue. */
export interface ArticleOption {
  readonly slug: string
  readonly title: string
}

const titleFromFrontmatter = (fm: ContentItem['frontmatter']): string => {
  const t = fm['title']
  return typeof t === 'string' && t.trim() !== '' ? t : ''
}

const shouldOverwrite = (
  existing: ArticleOption | undefined,
  candidate: ArticleOption
): boolean =>
  existing === undefined ||
  (existing.title === existing.slug && candidate.title !== candidate.slug)

const candidateFor = (item: ContentItem): ArticleOption => ({
  slug: item.slug,
  title: titleFromFrontmatter(item.frontmatter) || item.slug,
})

const accumulate = (
  acc: Map<string, ArticleOption>,
  item: ContentItem,
  taken: ReadonlySet<string>
): Map<string, ArticleOption> => {
  const candidate = candidateFor(item)
  return taken.has(item.slug)
    ? acc
    : shouldOverwrite(acc.get(item.slug), candidate)
      ? acc.set(item.slug, candidate)
      : acc
}

/**
 * Reduce the blog content store to a deduped, alphabetised list of
 * article slugs with the best human-readable title we can pull from
 * any of the language-specific frontmatters. Already-linked slugs
 * are filtered out so the picker offers only fresh choices.
 *
 * @param items All blog ContentItems from the store.
 * @param exclude Slugs already linked from the current newspaper.
 * @returns Alphabetised available articles.
 */
export const articleOptions = (
  items: readonly ContentItem[],
  exclude: readonly string[]
): readonly ArticleOption[] => {
  const taken = new Set(exclude)
  const bySlug = items.reduce<Map<string, ArticleOption>>(
    (acc, item) => accumulate(acc, item, taken),
    new Map()
  )
  return [...bySlug.values()].sort((a, b) => a.title.localeCompare(b.title))
}
