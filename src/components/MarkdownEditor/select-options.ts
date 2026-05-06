import type { LabelEntry } from '@/stores/labels'

/** A single option for a `<select>` control. */
export interface SelectOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

const localise = (entry: LabelEntry, lang: string): string =>
  entry.translations[lang] ?? entry.key

const toOption =
  (lang: string) =>
  (entry: LabelEntry): SelectOption => ({
    value: entry.key,
    label: localise(entry, lang),
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
 * Build select options from labels, keeping the current value
 * accessible even when it is not part of the labels store.
 * @param labels - Available label entries
 * @param lang - Current language for option text
 * @param current - Current selected value (may be unknown)
 * @returns Ordered options ready to render in a `<select>`
 */
export const buildLabelOptions = (
  labels: readonly LabelEntry[],
  lang: string,
  current: string
): readonly SelectOption[] => {
  const base = labels.map(toOption(lang))
  const isKnown = current === '' || base.some(includesKey(current))
  return isKnown ? base : [unknownOption(current), ...base]
}
