import { describe, expect, it } from 'vitest'
import type { Article } from '../rss/types'
import type { Subscriber } from '../subscribers/types'
import { computeDelta } from './calculator'

const article = (overrides: Partial<Article>): Article => ({
  guid: 'g',
  title: 't',
  link: 'https://x/',
  lang: 'ru',
  pubDate: '2026-06-01T00:00:00.000Z',
  ...overrides,
})

const sub = (overrides: Partial<Subscriber>): Subscriber => ({
  id: 1,
  email: 'a@b.c',
  langs: ['ru'],
  status: 'active',
  createdAt: '2026-05-01T00:00:00.000Z',
  lastSentAt: undefined,
  unsubscribedAt: undefined,
  ...overrides,
})

describe('computeDelta — basics', () => {
  it('returns every requested-lang article when lastSentAt is absent', () => {
    const s = sub({ langs: ['ru', 'en'] })
    const a = article({ guid: 'a', lang: 'ru' })
    const b = article({ guid: 'b', lang: 'en' })
    const c = article({ guid: 'c', lang: 'it' })
    expect(
      computeDelta(s, { ru: [a], en: [b], it: [c] }).map(x => x.guid)
    ).toEqual(['a', 'b'])
  })

  it('filters items older than (or equal to) lastSentAt', () => {
    const s = sub({
      langs: ['ru'],
      lastSentAt: '2026-06-01T00:00:00.000Z',
    })
    const old = article({ guid: 'old', pubDate: '2026-05-30T12:00:00.000Z' })
    const same = article({
      guid: 'same',
      pubDate: '2026-06-01T00:00:00.000Z',
    })
    const fresh = article({
      guid: 'new',
      pubDate: '2026-06-02T00:00:00.000Z',
    })
    expect(
      computeDelta(s, { ru: [old, same, fresh] }).map(x => x.guid)
    ).toEqual(['new'])
  })

  it('skips languages the subscriber does not subscribe to', () => {
    const s = sub({ langs: ['ru'] })
    const ru = article({ guid: 'ru', lang: 'ru' })
    const en = article({ guid: 'en', lang: 'en' })
    expect(computeDelta(s, { ru: [ru], en: [en] }).map(x => x.guid)).toEqual([
      'ru',
    ])
  })

  it('returns [] when nothing is new', () => {
    const s = sub({
      langs: ['ru'],
      lastSentAt: '2026-06-05T00:00:00.000Z',
    })
    expect(
      computeDelta(s, {
        ru: [article({ guid: 'a', pubDate: '2026-06-01T00:00:00.000Z' })],
      })
    ).toEqual([])
  })
})

describe('computeDelta — ordering + merging (R3.8)', () => {
  it('sorts merged langs by pubDate newest-first', () => {
    const s = sub({ langs: ['ru', 'en'] })
    const older = article({
      guid: 'older',
      lang: 'ru',
      pubDate: '2026-06-01T00:00:00.000Z',
    })
    const newer = article({
      guid: 'newer',
      lang: 'en',
      pubDate: '2026-06-03T00:00:00.000Z',
    })
    const middle = article({
      guid: 'middle',
      lang: 'ru',
      pubDate: '2026-06-02T00:00:00.000Z',
    })
    expect(
      computeDelta(s, {
        ru: [older, middle],
        en: [newer],
      }).map(x => x.guid)
    ).toEqual(['newer', 'middle', 'older'])
  })

  it('drops items whose pubDate is unparseable (defensive)', () => {
    const s = sub({ langs: ['ru'] })
    const good = article({ guid: 'good' })
    const bad = article({ guid: 'bad', pubDate: 'not-a-date' })
    expect(computeDelta(s, { ru: [good, bad] }).map(x => x.guid)).toEqual([
      'good',
    ])
  })
})
