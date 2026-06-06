import type { Lang } from '../subscribers/types'
import { CONF_BL, CONF_RU, CONF_UK } from './i18n-cyrillic'
import { CONF_EN, CONF_ES, CONF_IT, CONF_PL } from './i18n-latin'
import type { ConfirmationChrome } from './i18n-types'

export type { ConfirmationChrome } from './i18n-types'

/** In-worker dictionary for the public unsubscribe surface. */
export const CONFIRMATION: Readonly<Record<Lang, ConfirmationChrome>> = {
  en: CONF_EN,
  ru: CONF_RU,
  it: CONF_IT,
  es: CONF_ES,
  uk: CONF_UK,
  pl: CONF_PL,
  bl: CONF_BL,
}

/** Shared mailto target used by every confirmation page. */
export const RE_SUBSCRIBE_MAILTO = 'mailto:public@comprom.org'
