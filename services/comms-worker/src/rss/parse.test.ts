import { describe, expect, it } from 'vitest'
import { parseRss } from './parse'

const BASE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Communist Prometheus</title>
    <link>https://comprom.org/ru/</link>
    <description>News in Russian</description>
    <item>
      <guid>https://comprom.org/ru/articles/a/</guid>
      <title>Первая статья</title>
      <link>https://comprom.org/ru/articles/a/</link>
      <description>Тестовая аннотация</description>
      <pubDate>Mon, 01 Jun 2026 09:00:00 GMT</pubDate>
    </item>
    <item>
      <guid>https://comprom.org/ru/articles/b/</guid>
      <title>Вторая статья</title>
      <link>https://comprom.org/ru/articles/b/</link>
      <pubDate>2026-06-02T12:00:00.000Z</pubDate>
    </item>
  </channel>
</rss>`

describe('parseRss — happy path', () => {
  it('extracts every item with guid, title, link, pubDate normalised to ISO', () => {
    const items = parseRss(BASE, 'ru')
    expect(items).toHaveLength(2)
    expect(items[0]).toEqual({
      guid: 'https://comprom.org/ru/articles/a/',
      title: 'Первая статья',
      link: 'https://comprom.org/ru/articles/a/',
      lang: 'ru',
      pubDate: '2026-06-01T09:00:00.000Z',
    })
    expect(items[1]?.pubDate).toBe('2026-06-02T12:00:00.000Z')
  })

  it('attaches the requested lang to every item', () => {
    const items = parseRss(BASE, 'en')
    expect(items.every(i => i.lang === 'en')).toBe(true)
  })
})

describe('parseRss — tolerance', () => {
  it('handles a UTF-8 BOM prefix', () => {
    const items = parseRss(`﻿${BASE}`, 'ru')
    expect(items).toHaveLength(2)
  })

  it('handles CDATA-wrapped titles and descriptions', () => {
    const xml = BASE.replace(
      '<title>Первая статья</title>',
      '<title><![CDATA[Первая статья]]></title>'
    )
    const items = parseRss(xml, 'ru')
    expect(items[0]?.title).toBe('Первая статья')
  })

  it('skips items that are missing a guid', () => {
    const xml = BASE.replace(
      /<guid>https:\/\/comprom\.org\/ru\/articles\/a\/<\/guid>\s*/,
      ''
    )
    const items = parseRss(xml, 'ru')
    expect(items.map(i => i.guid)).toEqual([
      'https://comprom.org/ru/articles/b/',
    ])
  })

  it('skips items whose pubDate cannot be parsed', () => {
    const xml = BASE.replace(
      '<pubDate>Mon, 01 Jun 2026 09:00:00 GMT</pubDate>',
      '<pubDate>definitely-not-a-date</pubDate>'
    )
    const items = parseRss(xml, 'ru')
    expect(items.map(i => i.guid)).toEqual([
      'https://comprom.org/ru/articles/b/',
    ])
  })

  it('returns an empty array when there are no <item> tags', () => {
    expect(
      parseRss(
        '<?xml version="1.0"?><rss><channel><title>x</title></channel></rss>',
        'ru'
      )
    ).toEqual([])
  })

  it('decodes the common XML entities in titles', () => {
    const xml = BASE.replace(
      '<title>Первая статья</title>',
      '<title>News &amp; Notes &lt;2026&gt;</title>'
    )
    const items = parseRss(xml, 'ru')
    expect(items[0]?.title).toBe('News & Notes <2026>')
  })
})
