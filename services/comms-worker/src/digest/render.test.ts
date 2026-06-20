import { describe, expect, it } from 'vitest'
import type { NewspaperSelection } from '../newspaper/classify'
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
  it('uses English chrome regardless of the subscriber language (ru)', () => {
    const d = renderDigest({
      subscriber: SUB,
      articles: ARTICLES,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.subject).toBe('Communist Prometheus — 2 new articles')
  })

  it('keeps English chrome for an English subscriber too', () => {
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

  it('renders one section header per language when multilingual', () => {
    const d = renderDigest({
      subscriber: SUB,
      articles: ARTICLES,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.html).toContain('>RU<')
    expect(d.html).toContain('>EN<')
    expect(d.text).toContain('[RU]')
    expect(d.text).toContain('[EN]')
  })

  it('omits the section header for a single-language subscriber', () => {
    const d = renderDigest({
      subscriber: { ...SUB, langs: ['en'] },
      articles: ARTICLES.filter(a => a.lang === 'en'),
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.html).not.toContain('>EN<')
    expect(d.text).not.toContain('[EN]')
  })

  it('does NOT include a "Read more" link per article', () => {
    const d = renderDigest({
      subscriber: SUB,
      articles: ARTICLES,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.html.toLowerCase()).not.toContain('read more')
    expect(d.html).not.toContain('Читать')
  })

  it('embeds a prefers-color-scheme:dark block for system theme support', () => {
    const d = renderDigest({
      subscriber: SUB,
      articles: ARTICLES,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.html).toContain('prefers-color-scheme: dark')
    expect(d.html).toContain('background:#1a1a1a')
  })
})

const NEW_ISSUE: Article = {
  guid: 'np-new',
  title: 'Prometheus Weekly #7',
  link: 'https://comprom.org/en/newspaper/weekly-7',
  lang: 'en',
  pubDate: '2026-06-05T08:00:00.000Z',
}

const OLD_ISSUE: Article = {
  guid: 'np-old',
  title: 'Prometheus Weekly #6',
  link: 'https://comprom.org/en/newspaper/weekly-6',
  lang: 'en',
  pubDate: '2026-05-20T08:00:00.000Z',
}

describe('renderDigest — newspaper', () => {
  it('renders a new issue at the top with the "New issue" banner + link', () => {
    const newspapers: NewspaperSelection = {
      announcements: [NEW_ISSUE],
      current: [],
    }
    const d = renderDigest({
      subscriber: { ...SUB, langs: ['en'] },
      articles: ARTICLES.filter(a => a.lang === 'en'),
      newspapers,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.html).toContain('New issue')
    expect(d.html).toContain('Prometheus Weekly #7')
    expect(d.html).toContain('en/newspaper/weekly-7?utm_source=newsletter')
    expect(d.text).toContain('New issue: Prometheus Weekly #7')
  })

  it('renders the current issue at the foot with the "Current issue" label', () => {
    const newspapers: NewspaperSelection = {
      announcements: [],
      current: [OLD_ISSUE],
    }
    const d = renderDigest({
      subscriber: { ...SUB, langs: ['en'] },
      articles: ARTICLES.filter(a => a.lang === 'en'),
      newspapers,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.html).toContain('Current issue')
    expect(d.html).toContain('Prometheus Weekly #6')
    expect(d.text).toContain('Current issue: Prometheus Weekly #6')
  })

  it('falls back to the new-issue subject when there are no new articles', () => {
    const newspapers: NewspaperSelection = {
      announcements: [NEW_ISSUE],
      current: [],
    }
    const d = renderDigest({
      subscriber: { ...SUB, langs: ['en'] },
      articles: [],
      newspapers,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.subject).toBe(
      'Communist Prometheus — new issue: Prometheus Weekly #7'
    )
  })

  it('keeps the article-count subject when articles AND a new issue exist', () => {
    const newspapers: NewspaperSelection = {
      announcements: [NEW_ISSUE],
      current: [],
    }
    const d = renderDigest({
      subscriber: { ...SUB, langs: ['en'] },
      articles: ARTICLES,
      newspapers,
      unsubscribeUrl: UNSUB,
      tickAt: TICK,
    })
    expect(d.subject).toBe('Communist Prometheus — 2 new articles')
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
