import type { LabelEntry } from '@/stores/labels'

/**
 * Create a new empty label entry.
 * @returns Label entry with empty key and translations
 */
export const emptyLabel = (): LabelEntry => ({
  key: '',
  translations: {},
})

/**
 * Update the key of a label entry at a given index.
 * @param draft - Current draft array
 * @param index - Index of the entry to update
 * @param value - New key value
 * @returns Updated draft array
 */
export const updateKey = (
  draft: readonly LabelEntry[],
  index: number,
  value: string
): LabelEntry[] =>
  draft.map((e, i) => (i === index ? { ...e, key: value } : e))

/**
 * Update a translation for a label entry.
 * @param draft - Current draft array
 * @param index - Index of the entry to update
 * @param lang - Language code
 * @param value - New translation value
 * @returns Updated draft array
 */
export const updateTranslation = (
  draft: readonly LabelEntry[],
  index: number,
  lang: string,
  value: string
): LabelEntry[] =>
  draft.map((e, i) =>
    i === index
      ? {
          ...e,
          translations: { ...e.translations, [lang]: value },
        }
      : e
  )

/**
 * Check if a label entry has meaningful content.
 * @param entry - Label entry to validate
 * @returns Whether the entry has a non-empty key
 */
export const isValidEntry = (entry: LabelEntry): boolean =>
  entry.key.trim() !== ''
