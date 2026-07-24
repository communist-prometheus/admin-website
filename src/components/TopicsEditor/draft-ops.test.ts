import { describe, expect, it } from 'vitest'
import type { TopicEntry } from '@/stores/topics'
import {
  cloneTopic,
  emptyTopic,
  isValidEntry,
  updateColor,
  updateKey,
  updateName,
  updateSubtitle,
} from './draft-ops'

const sample: readonly TopicEntry[] = [
  {
    key: 'editorial',
    color: '#b03a2e',
    name: { en: 'Editorial' },
    subtitle: {},
  },
  { key: 'translation', color: '#2563eb', name: {}, subtitle: {} },
]

describe('emptyTopic', () => {
  it('creates a blank entry with a default colour and empty maps', () => {
    const topic = emptyTopic()
    expect(topic.key).toBe('')
    expect(topic.color).toMatch(/^#[0-9a-f]{6}$/i)
    expect(topic.name).toEqual({})
    expect(topic.subtitle).toEqual({})
  })
})

describe('updateKey / updateColor', () => {
  it('updates only the targeted entry key', () => {
    const next = updateKey(sample, 1, 'likbez')
    expect(next[1]?.key).toBe('likbez')
    expect(next[0]?.key).toBe('editorial')
  })

  it('updates only the targeted entry colour', () => {
    const next = updateColor(sample, 0, '#000000')
    expect(next[0]?.color).toBe('#000000')
    expect(next[1]?.color).toBe('#2563eb')
  })
})

describe('updateName / updateSubtitle', () => {
  it('sets a localized name without touching other languages', () => {
    const next = updateName(sample, 0, 'ru', 'От редакции')
    expect(next[0]?.name).toEqual({ en: 'Editorial', ru: 'От редакции' })
  })

  it('sets a localized subtitle independently of the name', () => {
    const next = updateSubtitle(sample, 0, 'en', 'Our own position')
    expect(next[0]?.subtitle).toEqual({ en: 'Our own position' })
    expect(next[0]?.name).toEqual({ en: 'Editorial' })
  })
})

describe('cloneTopic', () => {
  it('detaches the localized maps from the source', () => {
    const [first] = sample
    const copy = cloneTopic(first as TopicEntry)
    expect(copy.name).not.toBe(first?.name)
    expect(copy.subtitle).not.toBe(first?.subtitle)
    expect(copy).toEqual(first)
  })
})

describe('isValidEntry', () => {
  it('rejects entries with a blank key', () => {
    expect(isValidEntry(emptyTopic())).toBe(false)
    expect(isValidEntry({ ...emptyTopic(), key: '  ' })).toBe(false)
  })

  it('accepts entries with a non-empty key', () => {
    expect(isValidEntry({ ...emptyTopic(), key: 'editorial' })).toBe(true)
  })
})
