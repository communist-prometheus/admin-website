import type { Lang } from '../subscribers/types'
import { CHROME_BL, CHROME_RU, CHROME_UK } from './i18n-cyrillic'
import { CHROME_EN, CHROME_ES, CHROME_IT, CHROME_PL } from './i18n-latin'
import type { DigestChrome } from './i18n-types'

export type { DigestChrome } from './i18n-types'

/** In-worker dictionary, one entry per supported `Lang`. */
export const CHROME: Readonly<Record<Lang, DigestChrome>> = {
  en: CHROME_EN,
  ru: CHROME_RU,
  it: CHROME_IT,
  es: CHROME_ES,
  uk: CHROME_UK,
  pl: CHROME_PL,
  bl: CHROME_BL,
}
