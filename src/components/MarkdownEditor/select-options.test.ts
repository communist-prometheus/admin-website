import { describe, expect, it } from 'vitest'
import type { LabelEntry } from '@/stores/labels'
import { buildLabelOptions } from './select-options'

const labels: readonly LabelEntry[] = [
  { key: 'news', translations: { en: 'News', uk: 'Новини' } },
  { key: 'op-ed', translations: { en: 'Op-ed' } },
]

describe('buildLabelOptions', () => {
  it('returns one option per label, localised by lang', () => {
    const options = buildLabelOptions(labels, 'en', '')
    expect(options).toEqual([
      { value: 'news', label: 'News' },
      { value: 'op-ed', label: 'Op-ed' },
    ])
  })

  it('falls back to key when lang has no translation', () => {
    const options = buildLabelOptions(labels, 'uk', '')
    expect(options[1]).toEqual({ value: 'op-ed', label: 'op-ed' })
  })

  it('keeps the current value as a known option without duplication', () => {
    const options = buildLabelOptions(labels, 'en', 'news')
    expect(options.map(o => o.value)).toEqual(['news', 'op-ed'])
    expect(options.every(o => o.disabled !== true)).toBe(true)
  })

  it('prepends a disabled fallback when current is unknown', () => {
    const options = buildLabelOptions(labels, 'en', 'legacy-cat')
    expect(options[0]).toEqual({
      value: 'legacy-cat',
      label: '(unknown: legacy-cat)',
      disabled: true,
    })
    expect(options.slice(1).map(o => o.value)).toEqual(['news', 'op-ed'])
  })

  it('treats empty current as known (no fallback prepended)', () => {
    const options = buildLabelOptions(labels, 'en', '')
    expect(options[0]?.disabled).toBeUndefined()
  })
})
