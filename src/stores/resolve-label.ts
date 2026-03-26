import type { LabelEntry } from '@/validation/schemas/labels'

/**
 * Find a label entry by key or by translation value.
 * @param value - Key or translated text to look up
 * @param labels - Available label entries
 * @returns Matching label entry or undefined
 */
const findEntry = (
  value: string,
  labels: readonly LabelEntry[]
): LabelEntry | undefined =>
  labels.find(l => l.key === value) ??
  labels.find(l => Object.values(l.translations).includes(value))

/**
 * Resolve a label key (or legacy text) to translated text.
 * Works with both key-based and text-based category values.
 * @param value - Label key or legacy translated text
 * @param lang - Language code for translation
 * @param labels - Available label entries
 * @returns Translated string or the value itself as fallback
 */
export const resolveLabel = (
  value: string,
  lang: string,
  labels: readonly LabelEntry[]
): string => {
  const entry = findEntry(value, labels)
  return entry?.translations[lang] ?? value
}
