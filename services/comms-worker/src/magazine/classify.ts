import type { Article } from '../rss/types'
import type { Subscriber } from '../subscribers/types'
import type { IssuesByLang } from './fetch'

/**
 * The magazine issues a subscriber sees, split by how they appear:
 * `announcements` are issues published since the cutoff (a NEW issue —
 * goes first, with the "new issue" banner); `current` are issues that
 * predate the cutoff (already announced — go last, as "current issue").
 * Per language at most one of the two carries that language's latest
 * issue.
 */
export type MagazineSelection = {
  readonly announcements: ReadonlyArray<Article>
  readonly current: ReadonlyArray<Article>
}

const isNew = (issue: Article, cutoffMs: number | undefined): boolean => {
  const ms = Date.parse(issue.pubDate)
  if (!Number.isFinite(ms)) return false
  return cutoffMs === undefined || ms > cutoffMs
}

/**
 * Classify each of a subscriber's languages' latest issue as a NEW
 * announcement (published after the cutoff) or the CURRENT issue
 * (already announced). De-duplicates the same issue shared across
 * languages by `guid`, preserving the subscriber's language order.
 * @param sub The recipient.
 * @param byLang Latest issue per language.
 * @param cutoffMs Global cutoff in ms (undefined = no cutoff yet).
 * @returns Issues split into announcements + current.
 */
export const classifyMagazines = (
  sub: Subscriber,
  byLang: IssuesByLang,
  cutoffMs: number | undefined
): MagazineSelection => {
  const announcements: Article[] = []
  const current: Article[] = []
  const seen = new Set<string>()
  for (const lang of sub.langs) {
    const issue = byLang[lang]
    if (issue === undefined || seen.has(issue.guid)) continue
    seen.add(issue.guid)
    ;(isNew(issue, cutoffMs) ? announcements : current).push(issue)
  }
  return { announcements, current }
}
