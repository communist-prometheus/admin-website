import { htmlEscape } from '../digest/escape'
import type { Lang } from '../subscribers/types'
import { CONFIRMATION_STYLE } from './confirmation-style'
import type { ConfirmationChrome } from './i18n'

/**
 * Shared HTML chrome for every public unsubscribe page.
 * @param lang Document language.
 * @param c Localised chrome strings (used for the title).
 * @param heading Card heading (escaped here).
 * @param body Card paragraph (escaped here).
 * @param footer Pre-rendered, ALREADY-ESCAPED footer block (CTA link
 * or confirm form) — callers own its escaping.
 * @returns Full HTML document string.
 */
export const renderPage = (
  lang: Lang,
  c: ConfirmationChrome,
  heading: string,
  body: string,
  footer: string
): string =>
  [
    '<!DOCTYPE html>',
    `<html lang="${lang}"><head>`,
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width,initial-scale=1" />',
    `<title>${htmlEscape(c.title)}</title>`,
    CONFIRMATION_STYLE,
    '</head><body><main><article class="card">',
    `<h1>${htmlEscape(heading)}</h1>`,
    `<p>${htmlEscape(body)}</p>`,
    footer,
    '</article></main></body></html>',
  ].join('')
