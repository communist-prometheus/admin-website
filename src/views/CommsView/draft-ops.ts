import type { Lang } from '@/validation/schemas/subscriber'

/** All languages supported by both the worker and the public site. */
export const ALL_LANGS: ReadonlyArray<Lang> = [
  'en',
  'ru',
  'it',
  'es',
  'uk',
  'pl',
  'bl',
]

/** Loose email-shape check used to gate the "Add" button. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * True iff the form has a valid-looking email and at least one lang.
 * @param email Raw input value.
 * @param langs Picked language list.
 * @returns Whether the submit button should be enabled.
 */
export const canSubmitNewSubscriber = (
  email: string,
  langs: ReadonlyArray<Lang>
): boolean => EMAIL_RE.test(email.trim()) && langs.length > 0

/**
 * Toggle a lang in the array immutably.
 * @param current Existing langs.
 * @param lang Lang to flip.
 * @returns New langs list.
 */
export const toggleLang = (
  current: ReadonlyArray<Lang>,
  lang: Lang
): ReadonlyArray<Lang> =>
  current.includes(lang)
    ? current.filter(l => l !== lang)
    : [...current, lang]
