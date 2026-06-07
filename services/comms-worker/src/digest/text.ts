import type { Lang } from '../subscribers/types'
import type { LangGroups, StampedArticle } from './html'
import type { DigestChrome } from './i18n-types'

const renderItem = ([article, url]: StampedArticle): string =>
  `· ${article.title}  (${article.pubDate.slice(0, 10)})\n  ${url}`

const renderGroup = (
  lang: Lang,
  items: ReadonlyArray<StampedArticle>,
  showHeader: boolean
): string => {
  const head = showHeader ? `[${lang.toUpperCase()}]\n` : ''
  return head + items.map(renderItem).join('\n\n')
}

/**
 * Render the plain-text digest body. Mirrors the HTML structure
 * minus the inline styling: per-language sections when the recipient
 * subscribes to more than one language, intro line at the top,
 * unsubscribe URL at the bottom.
 * @param chrome Localised strings for the recipient.
 * @param groups Articles grouped by language, recipient-order.
 * @param unsubscribeUrl Per-recipient unsubscribe URL.
 * @returns Complete plain-text string.
 */
export const renderText = (
  chrome: DigestChrome,
  groups: LangGroups,
  unsubscribeUrl: string
): string => {
  const showHeaders = groups.length > 1
  const sections = groups
    .map(([lang, items]) => renderGroup(lang, items, showHeaders))
    .join('\n\n')
  return [
    chrome.intro,
    '',
    sections,
    '',
    '---',
    chrome.unsubscribeNote,
    `${chrome.unsubscribeLabel}: ${unsubscribeUrl}`,
  ].join('\n')
}
