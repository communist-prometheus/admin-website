import { htmlEscape } from './escape'
import { CARD_STYLE } from './html-shared'
import type { DigestChrome } from './i18n-types'

/**
 * Inline `<style>` block driving the dark-mode override via
 * `prefers-color-scheme: dark`. Kept compact so it survives the
 * various email client style strippers.
 * @returns `<head>` element with charset, viewport and the dark
 *   override block.
 */
export const renderHead = (): string =>
  [
    '<head>',
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<style>',
    '@media (prefers-color-scheme: dark) {',
    'body, .container, .card { background:#1a1a1a !important;',
    'color:#f0f0f0 !important; }',
    '.muted { color:#9a9a9a !important; }',
    '.lang-head { color:#9a9a9a !important;',
    'border-color:#333 !important; }',
    '.divider { border-top-color:#333 !important; }',
    '.lead { color:#cfcfcf !important; }',
    'a.item-title { color:#f18771 !important; }',
    'a.footer-link { color:#f18771 !important; }',
    '}',
    '</style>',
    '</head>',
  ].join('')

/**
 * Render the masthead row — brand title + intro lead in localised
 * chrome copy. Light-mode defaults sit inline; dark-mode flips via
 * the `.card` selector in {@link renderHead}.
 * @param chrome Localised strings for the recipient.
 * @returns `<tr>` HTML for the masthead cell.
 */
export const renderHeader = (chrome: DigestChrome): string =>
  [
    `<tr><td class="card" style="padding:32px 28px 8px;${CARD_STYLE}">`,
    '<h1 style="margin:0;font-size:22px;color:#ee6f57;letter-spacing:-0.01em">',
    'Communist Prometheus',
    '</h1>',
    '<p class="lead" style="margin:6px 0 0;color:#555;font-size:14px">',
    htmlEscape(chrome.intro),
    '</p>',
    '</td></tr>',
  ].join('')

/**
 * Render the unsubscribe footer row — divider, localised note,
 * unsubscribe link.
 * @param chrome Localised strings for the recipient.
 * @param unsubscribeUrl Per-recipient unsubscribe URL.
 * @returns `<tr>` HTML for the footer cell.
 */
export const renderFooter = (
  chrome: DigestChrome,
  unsubscribeUrl: string
): string =>
  [
    `<tr><td class="card" style="padding:8px 28px 32px;${CARD_STYLE}">`,
    '<hr class="divider" style="border:none;border-top:1px solid #eee;margin:0 0 16px" />',
    '<p class="muted" style="margin:0;font-size:12px;color:#888;line-height:1.5">',
    htmlEscape(chrome.unsubscribeNote),
    '<br />',
    `<a href="${unsubscribeUrl}" class="footer-link" style="color:#ee6f57">`,
    htmlEscape(chrome.unsubscribeLabel),
    '</a>',
    '</p>',
    '</td></tr>',
  ].join('')
