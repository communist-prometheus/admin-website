import type { StampedArticle, StampedNewspapers } from './html-shared'
import type { DigestChrome } from './i18n-types'

const line = (label: string, [issue, url]: StampedArticle): string =>
  `${label}: ${issue.title}\n  ${url}`

/**
 * Plain-text new-issue announcements for the top of the digest.
 * @param chrome Localised strings.
 * @param issues Stamped issues published since the cutoff.
 * @returns Text block, or '' when there are none.
 */
export const renderAnnouncementsText = (
  chrome: DigestChrome,
  issues: ReadonlyArray<StampedArticle>
): string =>
  issues.length === 0
    ? ''
    : issues.map(i => `★ ${line(chrome.newIssueLabel, i)}`).join('\n\n')

/**
 * Plain-text "current issue" lines for the foot of the digest.
 * @param chrome Localised strings.
 * @param issues Stamped issues predating the cutoff.
 * @returns Text block, or '' when there are none.
 */
export const renderCurrentText = (
  chrome: DigestChrome,
  issues: ReadonlyArray<StampedArticle>
): string =>
  issues.length === 0
    ? ''
    : issues.map(i => line(chrome.currentIssueLabel, i)).join('\n\n')

/**
 * Assemble the optional newspaper text blocks around the article
 * sections: announcements first, sections, then current issues.
 * @param chrome Localised strings.
 * @param sections Already-rendered per-language article sections.
 * @param newspapers Stamped issues split into announcements + current.
 * @returns Joined body, dropping empty blocks.
 */
export const composeBody = (
  chrome: DigestChrome,
  sections: string,
  newspapers: StampedNewspapers
): string =>
  [
    renderAnnouncementsText(chrome, newspapers.announcements),
    sections,
    renderCurrentText(chrome, newspapers.current),
  ]
    .filter(part => part.length > 0)
    .join('\n\n')
