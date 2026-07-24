import { describe, expect, it } from 'vitest'
import type { LabelEntry } from '@/stores/labels'
import type { TopicEntry } from '@/stores/topics'
import { buildLabelOptions, buildTopicOptions } from './select-options'

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

const topics: readonly TopicEntry[] = [
  {
    key: 'editorial',
    color: '#b03a2e',
    name: { en: 'Editorial', ru: 'От редакции' },
    subtitle: {},
  },
  {
    key: 'translation',
    color: '#2563eb',
    name: { en: 'Translation' },
    subtitle: {},
  },
]

describe('buildTopicOptions', () => {
  it('returns one option per topic, localised by name', () => {
    const options = buildTopicOptions(topics, 'ru', '')
    expect(options).toEqual([
      { value: 'editorial', label: 'От редакции' },
      { value: 'translation', label: 'translation' },
    ])
  })

  it('falls back to the key when the language has no name', () => {
    const options = buildTopicOptions(topics, 'it', '')
    expect(options[0]).toEqual({ value: 'editorial', label: 'editorial' })
  })

  it('prepends a disabled fallback when current is unknown', () => {
    const options = buildTopicOptions(topics, 'en', 'legacy')
    expect(options[0]).toEqual({
      value: 'legacy',
      label: '(unknown: legacy)',
      disabled: true,
    })
  })
})
