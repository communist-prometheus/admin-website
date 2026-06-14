import { htmlEscape } from './escape'
import type { StampedArticle } from './html-shared'
import type { DigestChrome } from './i18n-types'

const banner = (label: string, [issue, url]: StampedArticle): string =>
  [
    '<div style="margin:4px 0 18px;padding:12px 16px;',
    'background:#fff3f0;border-left:3px solid #ee6f57;border-radius:6px">',
    '<div class="muted" style="font-size:12px;text-transform:uppercase;',
    'letter-spacing:0.08em;color:#888">',
    htmlEscape(label),
    '</div>',
    `<a href="${url}" class="item-title" style="display:block;`,
    'color:#ee6f57;text-decoration:none;font-size:17px;font-weight:700;',
    'line-height:1.3;margin-top:2px">',
    htmlEscape(issue.title),
    '</a>',
    '</div>',
  ].join('')

/**
 * New-issue announcements rendered at the TOP of the card: a flagged
 * banner per freshly-published issue, linking to its page.
 * @param chrome Localised strings.
 * @param issues Stamped (issue + UTM url) pairs published since cutoff.
 * @returns HTML, or '' when there are none.
 */
export const renderAnnouncements = (
  chrome: DigestChrome,
  issues: ReadonlyArray<StampedArticle>
): string => issues.map(i => banner(chrome.newIssueLabel, i)).join('')
