import { describe, expect, it } from 'vitest'
import type { Article } from '../rss/types'
import type { Subscriber } from '../subscribers/types'
import { renderDigest } from './render'

const SUB: Subscriber = {
  id: 42,
  email: 'reader@example.test',
  langs: ['ru', 'en'],
  status: 'active',
  createdAt: '2026-05-01T00:00:00.000Z',
  lastSentAt: undefined,
  unsubscribedAt: undefined,
}

const ARTICLES: ReadonlyArray<Article> = [
  {
    guid: 'g-en',
    title: 'Worker solidarity reaches new heights',
    link: 'https://comprom.org/en/articles/solidarity/',
    lang: 'en',
    pubDate: '2026-06-04T18:00:00.000Z',
  },
  {
    guid: 'g-ru',
    title: 'Хроника недели',
    link: 'https://comprom.org/ru/articles/khronika/',
    lang: 'ru',
    pubDate: '2026-06-03T12:00:00.000Z',
  },
]

const UNSUB = 'https://lists.comprom.org/unsubscribe?t=ABCDEF'
const TICK = new Date('2026-06-06T09:00:00.000Z')

describe('renderDigest — subject', () => {
  it('uses the chrome of the subscriber primary lang (ru) with article count', () => {
    const d = renderDigest({
      subscriber: SUB,
      articles: ARTICLES,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.subject).toBe('Коммунистический Прометей — 2 новых статей')
  })

  it('switches chrome lang when the subscriber primary lang is English', () => {
    const d = renderDigest({
      subscriber: { ...SUB, langs: ['en'] },
      articles: ARTICLES,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.subject).toBe('Communist Prometheus — 2 new articles')
  })
})

describe('renderDigest — headers + body invariants', () => {
  it('builds RFC 8058 List-Unsubscribe + List-Unsubscribe-Post headers', () => {
    const d = renderDigest({
      subscriber: SUB,
      articles: ARTICLES,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.listUnsubscribe).toBe(`<${UNSUB}>`)
    expect(d.listUnsubscribePost).toBe('List-Unsubscribe=One-Click')
  })

  it('appends UTM (utm_campaign=2026-23 from tickAt) to every article link', () => {
    const d = renderDigest({
      subscriber: SUB,
      articles: ARTICLES,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    for (const a of ARTICLES) {
      const stamped = `${a.link}?utm_source=newsletter&utm_medium=email&utm_campaign=2026-23`
      expect(d.html).toContain(stamped)
      expect(d.text).toContain(stamped)
    }
  })

  it('includes the unsubscribe URL in both HTML and text bodies', () => {
    const d = renderDigest({
      subscriber: SUB,
      articles: ARTICLES,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.html).toContain(UNSUB)
    expect(d.text).toContain(UNSUB)
  })

  it('html-escapes article titles (no raw < > in markup)', () => {
    const tricky: Article = {
      guid: 'g',
      title: '<script>x</script>',
      link: 'https://x/y',
      lang: 'en',
      pubDate: '2026-06-04T00:00:00.000Z',
    }
    const d = renderDigest({
      subscriber: { ...SUB, langs: ['en'] },
      articles: [tricky],
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.html).not.toContain('<script>x</script>')
    expect(d.html).toContain('&lt;script&gt;')
  })

  it('shows a lang badge next to each article title in the HTML', () => {
    const d = renderDigest({
      subscriber: SUB,
      articles: ARTICLES,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.html).toContain('[ru]')
    expect(d.html).toContain('[en]')
  })
})

describe('renderDigest — snapshots', () => {
  it('matches the canonical HTML snapshot', () => {
    const d = renderDigest({
      subscriber: SUB,
      articles: ARTICLES,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.html).toMatchSnapshot()
  })

  it('matches the canonical text snapshot', () => {
    const d = renderDigest({
      subscriber: SUB,
      articles: ARTICLES,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.text).toMatchSnapshot()
  })
})
