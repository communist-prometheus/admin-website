import { renderFooter, renderHead, renderHeader } from './html-chrome'
import { renderGroups } from './html-groups'
import { renderAnnouncements } from './html-newspaper'
import { renderCurrentIssues } from './html-newspaper-current'
import {
  CARD_STYLE,
  type LangGroups,
  type StampedNewspapers,
} from './html-shared'
import type { DigestChrome } from './i18n-types'

export type {
  LangGroups,
  StampedArticle,
  StampedNewspapers,
} from './html-shared'

const renderBody = (
  chrome: DigestChrome,
  groups: LangGroups,
  newspapers: StampedNewspapers,
  unsubscribeUrl: string
): string =>
  [
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" ',
    'align="center" width="100%" class="container" ',
    'style="max-width:640px;margin:0 auto;background:#fff;color:#222">',
    renderHeader(chrome),
    `<tr><td class="card" style="padding:8px 28px 24px;${CARD_STYLE}">`,
    renderAnnouncements(chrome, newspapers.announcements),
    renderGroups(groups),
    renderCurrentIssues(chrome, newspapers.current),
    '</td></tr>',
    renderFooter(chrome, unsubscribeUrl),
    '</table>',
  ].join('')

/**
 * Render the digest HTML body. Groups articles by language in the
 * recipient's preferred order; renders per-language headers only when
 * the recipient subscribes to more than one language. Each item is a
 * single tappable headline + date — no redundant "Read more" link.
 * Light + dark theme via inline defaults and a
 * `@media (prefers-color-scheme: dark)` override block.
 * @param chrome Localised strings for the recipient.
 * @param groups Articles grouped by language, recipient-order.
 * @param newspapers Stamped newspaper issues (top announcements + foot current).
 * @param unsubscribeUrl Per-recipient unsubscribe URL.
 * @returns Complete HTML string.
 */
export const renderHtml = (
  chrome: DigestChrome,
  groups: LangGroups,
  newspapers: StampedNewspapers,
  unsubscribeUrl: string
): string =>
  [
    '<!DOCTYPE html>',
    '<html>',
    renderHead(),
    '<body style="margin:0;padding:24px 12px;background:#f6f6f6;color:#222;',
    'font-family:system-ui,Segoe UI,Roboto,sans-serif;line-height:1.4">',
    renderBody(chrome, groups, newspapers, unsubscribeUrl),
    '</body></html>',
  ].join('')
