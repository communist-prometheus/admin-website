import type { NewspaperSelection } from '../newspaper/classify'
import type { Article } from '../rss/types'
import type { Lang } from '../subscribers/types'
import type { LangGroups, StampedArticle, StampedNewspapers } from './html'
import { CHROME } from './i18n'
import type { DigestChrome } from './i18n-types'
import { appendUtm } from './utm'

/** Empty selection used when a render has no newspaper issues. */
export const EMPTY_NEWSPAPERS: NewspaperSelection = {
  announcements: [],
  current: [],
}

/**
 * Pair an article with its UTM-stamped link for the campaign.
 * @param a Article to stamp.
 * @param campaign ISO-week campaign tag.
 * @returns Article + tagged URL tuple.
 */
export const stampedFor = (a: Article, campaign: string): StampedArticle =>
  [a, appendUtm(a.link, campaign)] as const

/**
 * Group articles by language in the recipient's preferred order,
 * dropping languages with no items.
 * @param langs Recipient languages, in order.
 * @param articles Articles to group.
 * @param campaign ISO-week campaign tag.
 * @returns Non-empty per-language stamped groups.
 */
export const groupByLang = (
  langs: ReadonlyArray<Lang>,
  articles: ReadonlyArray<Article>,
  campaign: string
): LangGroups =>
  langs
    .map(lang => {
      const items = articles
        .filter(a => a.lang === lang)
        .map(a => stampedFor(a, campaign))
      return [lang, items] as const
    })
    .filter(([, items]) => items.length > 0)

/**
 * Pick the chrome dictionary for the subscriber's primary language.
 * @param langs Recipient languages, in order.
 * @returns Localised chrome strings.
 */
export const chromeFor = (langs: ReadonlyArray<Lang>): DigestChrome =>
  CHROME[langs[0] ?? 'en']

/**
 * UTM-stamp both arms of a newspaper selection for the campaign.
 * @param selection Announcements + current issues.
 * @param campaign ISO-week campaign tag.
 * @returns Stamped announcements + current pairs.
 */
export const stampNewspapers = (
  selection: NewspaperSelection,
  campaign: string
): StampedNewspapers => ({
  announcements: selection.announcements.map(a => stampedFor(a, campaign)),
  current: selection.current.map(a => stampedFor(a, campaign)),
})

/**
 * Choose the subject: the article-count line, or — when there are no
 * new articles but a new issue is out — the new-issue announcement.
 * @param chrome Localised strings.
 * @param articleCount New-article count.
 * @param announcements Freshly-published issues (may be empty).
 * @returns Subject line.
 */
export const subjectFor = (
  chrome: DigestChrome,
  articleCount: number,
  announcements: ReadonlyArray<Article>
): string =>
  articleCount === 0 && announcements.length > 0
    ? chrome.newIssueSubject(announcements[0]?.title ?? '')
    : chrome.subject(articleCount)
