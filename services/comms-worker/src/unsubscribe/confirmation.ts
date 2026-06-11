import { htmlEscape } from '../digest/escape'
import type { Lang } from '../subscribers/types'
import { CONFIRMATION, RE_SUBSCRIBE_MAILTO } from './i18n'
import { renderPage } from './render-page'

const reSubscribeCta = (label: string): string =>
  `<a class="cta" href="${RE_SUBSCRIBE_MAILTO}">${htmlEscape(label)}</a>`

/**
 * Render the confirm page for a valid GET. The flip itself happens
 * only when the visitor submits this POST form — a GET must stay
 * side-effect free so link prefetchers cannot unsubscribe people.
 * @param lang Lang code chosen from Accept-Language.
 * @param token Verified raw token, re-embedded as the form target.
 * @returns Full HTML document body.
 */
export const renderConfirmPage = (lang: Lang, token: string): string => {
  const c = CONFIRMATION[lang]
  const action = `/unsubscribe?t=${encodeURIComponent(token)}`
  const form =
    `<form method="post" action="${htmlEscape(action)}">` +
    `<button class="cta" type="submit">${htmlEscape(c.confirmButton)}</button>` +
    '</form>'
  return renderPage(lang, c, c.confirmHeading, c.confirmBody, form)
}

/**
 * Render the success confirmation page shown after the flip.
 * @param lang Lang code chosen from Accept-Language by the route handler.
 * @returns Full HTML document body.
 */
export const renderUnsubscribedPage = (lang: Lang): string => {
  const c = CONFIRMATION[lang]
  return renderPage(
    lang,
    c,
    c.unsubscribedHeading,
    c.unsubscribedBody,
    reSubscribeCta(c.reSubscribeLabel)
  )
}

/**
 * Render the generic 404 page for invalid / tampered tokens (R4.5).
 * @param lang Lang code chosen from Accept-Language.
 * @returns Full HTML document body.
 */
export const renderExpiredPage = (lang: Lang): string => {
  const c = CONFIRMATION[lang]
  return renderPage(
    lang,
    c,
    c.expiredHeading,
    c.expiredBody,
    reSubscribeCta(c.reSubscribeLabel)
  )
}
