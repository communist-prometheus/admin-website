import type { Lang } from '../subscribers/types'
import { htmlEscape } from './escape'
import type { LangGroups, StampedArticle } from './html-shared'

const renderItem = ([a, url]: StampedArticle): string => {
  const title = htmlEscape(a.title)
  const date = a.pubDate.slice(0, 10)
  return [
    '<li style="margin:14px 0;list-style:none">',
    `<a href="${url}" class="item-title" style="display:block;color:#ee6f57;`,
    'text-decoration:none;font-size:16px;line-height:1.35;font-weight:600">',
    title,
    '</a>',
    `<div class="muted" style="margin-top:4px;font-size:13px;color:#888">${date}</div>`,
    '</li>',
  ].join('')
}

const renderGroup = (
  lang: Lang,
  items: ReadonlyArray<StampedArticle>,
  showHeader: boolean
): string => {
  const head = showHeader
    ? [
        '<h2 class="lang-head" style="margin:24px 0 4px;font-size:13px;',
        'letter-spacing:0.08em;text-transform:uppercase;color:#888;',
        'border-bottom:1px solid #eee;padding:0 0 6px">',
        lang.toUpperCase(),
        '</h2>',
      ].join('')
    : ''
  return [
    head,
    '<ul style="padding:0;margin:0;list-style:none">',
    items.map(renderItem).join(''),
    '</ul>',
  ].join('')
}

/**
 * Render every per-language section as a single string. Section
 * headers are emitted only when the recipient subscribes to more
 * than one language — single-lang readers see a flat list.
 * @param groups Articles grouped by language, recipient-order.
 * @returns Concatenated HTML for all sections.
 */
export const renderGroups = (groups: LangGroups): string => {
  const showHeaders = groups.length > 1
  return groups
    .map(([lang, items]) => renderGroup(lang, items, showHeaders))
    .join('')
}
