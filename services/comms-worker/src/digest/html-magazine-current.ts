import { htmlEscape } from './escape'
import type { StampedArticle } from './html-shared'
import type { DigestChrome } from './i18n-types'

const line = (label: string, [issue, url]: StampedArticle): string =>
  [
    '<div style="margin:6px 0;font-size:14px">',
    `<span class="muted" style="color:#888">${htmlEscape(label)}: </span>`,
    `<a href="${url}" class="footer-link" `,
    'style="color:#ee6f57;text-decoration:none;font-weight:600">',
    htmlEscape(issue.title),
    '</a>',
    '</div>',
  ].join('')

/**
 * Already-announced latest issue rendered at the FOOT of the card as
 * a subtle "current issue" line, linking to its page.
 * @param chrome Localised strings.
 * @param issues Stamped (issue + UTM url) pairs predating the cutoff.
 * @returns HTML, or '' when there are none.
 */
export const renderCurrentIssues = (
  chrome: DigestChrome,
  issues: ReadonlyArray<StampedArticle>
): string =>
  issues.length === 0
    ? ''
    : [
        '<div class="divider" style="margin:20px 0 0;padding-top:14px;',
        'border-top:1px solid #eee">',
        issues.map(i => line(chrome.currentIssueLabel, i)).join(''),
        '</div>',
      ].join('')
