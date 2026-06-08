/**
 * Supported UI locales. English is the canonical default — every
 * key in the dictionary must have an English entry; other locales
 * may omit a key and the lookup will fall back to English.
 */
export type Locale = 'en' | 'ru'

const KNOWN: ReadonlyArray<Locale> = ['en', 'ru']

const isLocale = (s: string): s is Locale =>
  (KNOWN as ReadonlyArray<string>).includes(s)

const navigatorTag = (): string | undefined =>
  typeof navigator === 'undefined'
    ? undefined
    : (navigator.language ?? '').toLowerCase().split('-')[0]

const fromNavigator = (): Locale | undefined => {
  const tag = navigatorTag()
  return tag !== undefined && isLocale(tag) ? tag : undefined
}

/**
 * Resolve the active UI locale. Reads `navigator.language` and
 * falls back to English when the browser advertises something we
 * don't have a dictionary for.
 * @returns Active locale tag.
 */
export const detectLocale = (): Locale => fromNavigator() ?? 'en'
