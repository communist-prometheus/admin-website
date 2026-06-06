import { htmlEscape } from '../digest/escape'
import type { Lang } from '../subscribers/types'
import {
  CONFIRMATION,
  type ConfirmationChrome,
  RE_SUBSCRIBE_MAILTO,
} from './i18n'

const STYLE =
  '<style>body{font-family:system-ui,Segoe UI,sans-serif;' +
  'max-width:32rem;margin:3rem auto;padding:0 1rem;' +
  'color:#222;line-height:1.5}h1{font-size:1.5rem;margin-bottom:0.5rem}' +
  '.cta{display:inline-block;margin-top:1.25rem;padding:0.5rem 0.9rem;' +
  'border:1px solid currentColor;border-radius:0.375rem;' +
  'text-decoration:none;color:inherit}</style>'

const renderPage = (
  lang: Lang,
  c: ConfirmationChrome,
  heading: string,
  body: string
): string =>
  [
    '<!DOCTYPE html>',
    `<html lang="${lang}"><head>`,
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width,initial-scale=1" />',
    `<title>${htmlEscape(c.title)}</title>`,
    STYLE,
    '</head><body>',
    `<h1>${htmlEscape(heading)}</h1>`,
    `<p>${htmlEscape(body)}</p>`,
    `<a class="cta" href="${RE_SUBSCRIBE_MAILTO}">${htmlEscape(c.reSubscribeLabel)}</a>`,
    '</body></html>',
  ].join('')

/**
 * Render the success confirmation page shown after a token validates.
 * @param lang Lang code chosen from Accept-Language by the route handler.
 * @returns Full HTML document body.
 */
export const renderUnsubscribedPage = (lang: Lang): string => {
  const c = CONFIRMATION[lang]
  return renderPage(lang, c, c.unsubscribedHeading, c.unsubscribedBody)
}

/**
 * Render the generic 404 page for invalid / tampered tokens (R4.5).
 * @param lang Lang code chosen from Accept-Language.
 * @returns Full HTML document body.
 */
export const renderExpiredPage = (lang: Lang): string => {
  const c = CONFIRMATION[lang]
  return renderPage(lang, c, c.expiredHeading, c.expiredBody)
}
