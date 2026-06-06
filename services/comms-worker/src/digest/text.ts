import type { Article } from '../rss/types'
import type { DigestChrome } from './i18n-types'

const renderItem = (article: Article, stampedUrl: string): string =>
  `· ${article.title}  [${article.lang}] (${article.pubDate.slice(0, 10)})\n  ${stampedUrl}`

/**
 * Render the digest plain-text body — intro + bulleted article list +
 * footer with unsubscribe URL. Mirrors {@link renderHtml} structure.
 * @param chrome Localised strings for the recipient.
 * @param items Pre-stamped article + URL pairs.
 * @param unsubscribeUrl Per-recipient unsubscribe URL.
 * @returns Complete plain-text string.
 */
export const renderText = (
  chrome: DigestChrome,
  items: ReadonlyArray<readonly [Article, string]>,
  unsubscribeUrl: string
): string =>
  [
    chrome.intro,
    '',
    items.map(([a, u]) => renderItem(a, u)).join('\n\n'),
    '',
    '---',
    chrome.unsubscribeNote,
    `${chrome.unsubscribeLabel}: ${unsubscribeUrl}`,
  ].join('\n')
