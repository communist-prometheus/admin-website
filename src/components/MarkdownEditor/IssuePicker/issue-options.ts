import type { ContentItem } from '@/types/content'

/** A newspaper issue available to link a blog post to. */
export interface IssueOption {
  readonly slug: string
  readonly title: string
}

const titleFromFrontmatter = (fm: ContentItem['frontmatter']): string => {
  const t = fm['title']
  return typeof t === 'string' && t.trim() !== '' ? t : ''
}

const candidateFor = (item: ContentItem): IssueOption => ({
  slug: item.slug,
  title: titleFromFrontmatter(item.frontmatter) || item.slug,
})

const shouldOverwrite = (
  existing: IssueOption | undefined,
  candidate: IssueOption
): boolean =>
  existing === undefined ||
  (existing.title === existing.slug && candidate.title !== candidate.slug)

const accumulate = (
  acc: Map<string, IssueOption>,
  item: ContentItem
): Map<string, IssueOption> => {
  const candidate = candidateFor(item)
  return shouldOverwrite(acc.get(item.slug), candidate)
    ? acc.set(item.slug, candidate)
    : acc
}

/**
 * Reduce the newspaper content store to a deduped, alphabetised
 * list of issues with the best human-readable title pulled from
 * any language-specific frontmatter. The blog-side picker uses
 * this so editors choose the issue from the same set the
 * newspaper TOC will then echo.
 *
 * @param items All newspaper ContentItems from the store.
 * @returns Alphabetised available issues.
 */
export const issueOptions = (
  items: readonly ContentItem[]
): readonly IssueOption[] => {
  const bySlug = items.reduce<Map<string, IssueOption>>(accumulate, new Map())
  return [...bySlug.values()].sort((a, b) => a.title.localeCompare(b.title))
}
