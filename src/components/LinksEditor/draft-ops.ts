import type { LinkEntry } from '@/stores/links'

/** Editable string fields of a link entry. */
export type LinkField = 'url' | 'name' | 'category' | 'siteLang'

/**
 * A blank entry for the "add" action.
 * @returns An empty organization-category entry.
 */
export const emptyEntry = (): LinkEntry => ({
  url: '',
  name: '',
  category: 'organizations',
  siteLang: 'en',
  inRing: true,
  descriptions: {},
})

/**
 * Replace a string field on the entry at `index`.
 * @param draft - Current entries.
 * @param index - Target index.
 * @param field - Field to set.
 * @param value - New value.
 * @returns A new entries array.
 */
export const setField = (
  draft: readonly LinkEntry[],
  index: number,
  field: LinkField,
  value: string
): LinkEntry[] =>
  draft.map((e, i) => (i === index ? { ...e, [field]: value } : e))

/**
 * Toggle the webring membership flag on the entry at `index`.
 * @param draft - Current entries.
 * @param index - Target index.
 * @param value - New flag value.
 * @returns A new entries array.
 */
export const setInRing = (
  draft: readonly LinkEntry[],
  index: number,
  value: boolean
): LinkEntry[] =>
  draft.map((e, i) => (i === index ? { ...e, inRing: value } : e))

/**
 * Set a per-language description on the entry at `index`.
 * @param draft - Current entries.
 * @param index - Target index.
 * @param lang - Language code.
 * @param value - New description.
 * @returns A new entries array.
 */
export const setDescription = (
  draft: readonly LinkEntry[],
  index: number,
  lang: string,
  value: string
): LinkEntry[] =>
  draft.map((e, i) =>
    i === index
      ? { ...e, descriptions: { ...e.descriptions, [lang]: value } }
      : e
  )

/**
 * Whether an entry is complete enough to persist (url + name).
 * @param entry - The entry to test.
 * @returns True when both url and name are non-empty.
 */
export const isValidEntry = (entry: LinkEntry): boolean =>
  entry.url.trim() !== '' && entry.name.trim() !== ''
