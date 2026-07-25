import type { LabelEntry } from '@/stores/labels'
import type { TopicEntry } from '@/stores/topics'

/** A single option for a `<select>` control. */
export interface SelectOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

const toLabelOption =
  (lang: string) =>
  (entry: LabelEntry): SelectOption => ({
    value: entry.key,
    label: entry.translations[lang] ?? entry.key,
  })

const toTopicOption =
  (lang: string) =>
  (entry: TopicEntry): SelectOption => ({
    value: entry.key,
    label: entry.name[lang] ?? entry.key,
  })

const unknownOption = (key: string): SelectOption => ({
  value: key,
  label: `(unknown: ${key})`,
  disabled: true,
})

const includesKey =
  (key: string) =>
  (opt: SelectOption): boolean =>
    opt.value === key

/**
 * Keep the current value selectable even when it is not part of the
 * source store, so an unknown key stays visible instead of vanishing.
 * @param base - Options built from the store
 * @param current - Current selected value (may be unknown)
 * @returns Ordered options ready to render in a `<select>`
 */
const withCurrent = (
  base: readonly SelectOption[],
  current: string
): readonly SelectOption[] => {
  const isKnown = current === '' || base.some(includesKey(current))
  return isKnown ? base : [unknownOption(current), ...base]
}

/**
 * Build select options from labels.
 * @param labels - Available label entries
 * @param lang - Current language for option text
 * @param current - Current selected value (may be unknown)
 * @returns Ordered options ready to render in a `<select>`
 */
export const buildLabelOptions = (
  labels: readonly LabelEntry[],
  lang: string,
  current: string
): readonly SelectOption[] =>
  withCurrent(labels.map(toLabelOption(lang)), current)

/**
 * Build select options from editorial topics (localized by name).
 * @param topics - Available topic entries
 * @param lang - Current language for option text
 * @param current - Current selected value (may be unknown)
 * @returns Ordered options ready to render in a `<select>`
 */
export const buildTopicOptions = (
  topics: readonly TopicEntry[],
  lang: string,
  current: string
): readonly SelectOption[] =>
  withCurrent(topics.map(toTopicOption(lang)), current)
