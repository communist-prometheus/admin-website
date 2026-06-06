import { LANGS, type Lang } from '../subscribers/types'

const SUPPORTED = new Set<string>(LANGS)
const FALLBACK: Lang = 'en'

type Entry = { readonly tag: string; readonly q: number }

const parseEntry = (raw: string, index: number): Entry | undefined => {
  const trimmed = raw.trim()
  if (trimmed === '') return undefined
  const [tagPart, ...params] = trimmed.split(';')
  const tag = (tagPart ?? '').trim().toLowerCase()
  if (tag === '') return undefined
  const qParam = params.map(p => p.trim()).find(p => p.startsWith('q='))
  const q = qParam === undefined ? 1 : Number(qParam.slice(2))
  return Number.isFinite(q) && q > 0
    ? { tag, q: q - index * 1e-6 }
    : undefined
}

const baseTag = (tag: string): string => {
  const dash = tag.indexOf('-')
  return dash === -1 ? tag : tag.slice(0, dash)
}

/**
 * Pick the best-matching supported language from an HTTP
 * Accept-Language header, falling back to English. Region tags are
 * stripped (`ru-RU` → `ru`); `q=0` and `*` are treated as opt-outs.
 * @param header Raw `Accept-Language` value or `undefined`.
 * @returns One of the supported {@link Lang} codes.
 */
export const pickLang = (header: string | undefined): Lang => {
  if (header === undefined) return FALLBACK
  const entries = header
    .split(',')
    .map(parseEntry)
    .filter((e): e is Entry => e !== undefined)
    .sort((a, b) => b.q - a.q)
  for (const e of entries) {
    const base = baseTag(e.tag)
    if (SUPPORTED.has(base)) return base as Lang
  }
  return FALLBACK
}
