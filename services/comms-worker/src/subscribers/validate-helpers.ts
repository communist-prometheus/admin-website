import { LANGS, type Lang } from './types'

/** Loose RFC-5322-ish email shape check. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const allowedLangs = new Set<string>(LANGS)

/** Type guard for a supported language code. */
export const isLang = (v: unknown): v is Lang =>
  typeof v === 'string' && allowedLangs.has(v)

/**
 * Narrow an unknown value to a non-empty list of language codes.
 * @param v Raw value.
 * @returns The narrowed list, or undefined when invalid/absent.
 */
export const parseLangs = (v: unknown): ReadonlyArray<Lang> | undefined =>
  Array.isArray(v) && v.length > 0 && v.every(isLang) ? v : undefined
