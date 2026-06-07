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

const ms = (iso: string): number => Date.parse(iso)

describe('computeDelta — basics', () => {
  it('returns every requested-lang article when cutoffMs is undefined', () => {
    const s = sub({ langs: ['ru', 'en'] })
    const a = article({ guid: 'a', lang: 'ru' })
    const b = article({ guid: 'b', lang: 'en' })
    const c = article({ guid: 'c', lang: 'it' })
    expect(
      computeDelta(s, { ru: [a], en: [b], it: [c] }, undefined).map(
        x => x.guid
      )
    ).toEqual(['a', 'b'])
  })

  it('filters items older than (or equal to) the global cutoff', () => {
    const s = sub({ langs: ['ru'] })
    const cutoff = ms('2026-06-01T00:00:00.000Z')
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
      computeDelta(s, { ru: [old, same, fresh] }, cutoff).map(x => x.guid)
    ).toEqual(['new'])
  })

  it('skips languages the subscriber does not subscribe to', () => {
    const s = sub({ langs: ['ru'] })
    const ru = article({ guid: 'ru', lang: 'ru' })
    const en = article({ guid: 'en', lang: 'en' })
    expect(
      computeDelta(s, { ru: [ru], en: [en] }, undefined).map(x => x.guid)
    ).toEqual(['ru'])
  })

  it('returns [] when nothing is new', () => {
    const s = sub({ langs: ['ru'] })
    const cutoff = ms('2026-06-05T00:00:00.000Z')
    expect(
      computeDelta(
        s,
        {
          ru: [article({ guid: 'a', pubDate: '2026-06-01T00:00:00.000Z' })],
        },
        cutoff
      )
    ).toEqual([])
  })

  it('treats the cutoff as global — same boundary for every subscriber', () => {
    const cutoff = ms('2026-06-01T00:00:00.000Z')
    const ru = sub({ id: 1, langs: ['ru'] })
    const en = sub({ id: 2, langs: ['en'] })
    const fresh = article({ guid: 'f', pubDate: '2026-06-02T00:00:00.000Z' })
    expect(
      computeDelta(ru, { ru: [fresh] }, cutoff).map(x => x.guid)
    ).toEqual(['f'])
    expect(
      computeDelta(en, { en: [{ ...fresh, lang: 'en' }] }, cutoff).map(
        x => x.guid
      )
    ).toEqual(['f'])
  })
})

describe('computeDelta — ordering + merging', () => {
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
      computeDelta(
        s,
        {
          ru: [older, middle],
          en: [newer],
        },
        undefined
      ).map(x => x.guid)
    ).toEqual(['newer', 'middle', 'older'])
  })

  it('drops items whose pubDate is unparseable (defensive)', () => {
    const s = sub({ langs: ['ru'] })
    const good = article({ guid: 'good' })
    const bad = article({ guid: 'bad', pubDate: 'not-a-date' })
    expect(
      computeDelta(s, { ru: [good, bad] }, undefined).map(x => x.guid)
    ).toEqual(['good'])
  })
})
