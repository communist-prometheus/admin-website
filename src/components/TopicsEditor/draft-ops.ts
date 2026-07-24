import type { TopicEntry } from '@/stores/topics'

const DEFAULT_COLOR = '#3b82f6'

type LocalizedField = 'name' | 'subtitle'

/**
 * Create a new empty topic entry with a default colour.
 * @returns Topic entry with empty key and localized maps
 */
export const emptyTopic = (): TopicEntry => ({
  key: '',
  color: DEFAULT_COLOR,
  name: {},
  subtitle: {},
})

/**
 * Update the key of a topic entry at a given index.
 * @param draft - Current draft array
 * @param index - Index of the entry to update
 * @param value - New key value
 * @returns Updated draft array
 */
export const updateKey = (
  draft: readonly TopicEntry[],
  index: number,
  value: string
): TopicEntry[] =>
  draft.map((e, i) => (i === index ? { ...e, key: value } : e))

/**
 * Update the colour of a topic entry at a given index.
 * @param draft - Current draft array
 * @param index - Index of the entry to update
 * @param value - New colour value
 * @returns Updated draft array
 */
export const updateColor = (
  draft: readonly TopicEntry[],
  index: number,
  value: string
): TopicEntry[] =>
  draft.map((e, i) => (i === index ? { ...e, color: value } : e))

/**
 * Build an updater for a localized map field (name or subtitle).
 * @param field - Which localized field to write
 * @returns Updater producing a new draft with the value set
 */
const updateLocalized =
  (field: LocalizedField) =>
  (
    draft: readonly TopicEntry[],
    index: number,
    lang: string,
    value: string
  ): TopicEntry[] =>
    draft.map((e, i) =>
      i === index ? { ...e, [field]: { ...e[field], [lang]: value } } : e
    )

/** Update a localized name for a topic entry. */
export const updateName = updateLocalized('name')

/** Update a localized subtitle (приписка) for a topic entry. */
export const updateSubtitle = updateLocalized('subtitle')

/**
 * Deep-clone a topic entry so draft edits never mutate store state.
 * @param entry - Topic entry to clone
 * @returns A detached copy with fresh localized maps
 */
export const cloneTopic = (entry: TopicEntry): TopicEntry => ({
  ...entry,
  name: { ...entry.name },
  subtitle: { ...entry.subtitle },
})

/**
 * Check if a topic entry has meaningful content.
 * @param entry - Topic entry to validate
 * @returns Whether the entry has a non-empty key
 */
export const isValidEntry = (entry: TopicEntry): boolean =>
  entry.key.trim() !== ''
