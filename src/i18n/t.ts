import { EN } from './dict-en'
import { RU } from './dict-ru'
import { detectLocale, type Locale } from './locale'

const DICTS: Readonly<Record<Locale, unknown>> = {
  en: EN,
  ru: RU,
}

const isRecord = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const stepInto = (cur: unknown, segment: string): unknown =>
  isRecord(cur) ? cur[segment] : undefined

const lookup = (source: unknown, path: ReadonlyArray<string>): unknown =>
  path.reduce<unknown>((acc, seg) => stepInto(acc, seg), source)

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined

/**
 * Dotted-path key into the dictionary, e.g. `comms.cutoff.title`.
 * The English dictionary is the source of truth; missing keys in
 * other locales transparently fall back to the English string.
 * @param key Dotted-path key.
 * @returns Translation in the active locale (or English fallback).
 */
export const t = (key: string): string => {
  const path = key.split('.')
  const localised = asString(lookup(DICTS[detectLocale()], path))
  return localised ?? asString(lookup(EN, path)) ?? key
}
