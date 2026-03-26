import type { LabelEntry } from '@/validation/schemas/labels'

/**
 * Resolve a label key to its translated text.
 * @param key - Label key to look up
 * @param lang - Language code for translation
 * @param labels - Available label entries
 * @returns Translated string or the key itself as fallback
 */
export const resolveLabel = (
  key: string,
  lang: string,
  labels: readonly LabelEntry[]
): string => {
  const entry = labels.find(l => l.key === key)
  return entry?.translations[lang] ?? key
}
