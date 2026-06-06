import type { Article } from '../rss/types'
import { htmlEscape } from './escape'
import type { DigestChrome } from './i18n-types'

const renderItem = (
  article: Article,
  stampedUrl: string,
  chrome: DigestChrome
): string => {
  const title = htmlEscape(article.title)
  const date = article.pubDate.slice(0, 10)
  return [
    '<li style="margin-bottom:1rem">',
    `<a href="${stampedUrl}" style="font-weight:700;text-decoration:none">${title}</a>`,
    ` <span style="opacity:0.7">[${article.lang}]</span>`,
    ` <span style="opacity:0.6;font-size:0.85em"> · ${date}</span>`,
    ' <br />',
    `<a href="${stampedUrl}" style="font-size:0.875em">${chrome.readLabel} →</a>`,
    '</li>',
  ].join('')
}

/**
 * Render the digest HTML body: intro line, ordered article list with
 * lang badges + UTM-stamped links, footer with unsubscribe URL.
 * @param chrome Localised strings for the recipient.
 * @param items Pre-stamped article + URL pairs.
 * @param unsubscribeUrl Per-recipient unsubscribe URL.
 * @returns Complete HTML string.
 */
export const renderHtml = (
  chrome: DigestChrome,
  items: ReadonlyArray<readonly [Article, string]>,
  unsubscribeUrl: string
): string =>
  [
    '<!DOCTYPE html>',
    '<html><body style="font-family:system-ui,Segoe UI,sans-serif;max-width:36rem;margin:1rem auto;color:#222">',
    `<p>${htmlEscape(chrome.intro)}</p>`,
    '<ol style="padding-left:1.25rem">',
    items.map(([a, u]) => renderItem(a, u, chrome)).join(''),
    '</ol>',
    '<hr style="border:none;border-top:1px solid #ccc;margin:2rem 0 1rem" />',
    `<p style="font-size:0.8125em;opacity:0.7">${htmlEscape(chrome.unsubscribeNote)}<br />`,
    `<a href="${unsubscribeUrl}">${htmlEscape(chrome.unsubscribeLabel)}</a></p>`,
    '</body></html>',
  ].join('')
