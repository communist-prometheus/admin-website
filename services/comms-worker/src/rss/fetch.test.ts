import { describe, expect, it, vi } from 'vitest'
import { createRssFetcher, FALLBACK_BASE } from './fetch'

const xml = `<?xml version="1.0"?>
<rss><channel><title>x</title>
<item>
  <guid>g1</guid>
  <title>T</title>
  <link>https://x/y</link>
  <pubDate>2026-06-01T00:00:00Z</pubDate>
</item>
</channel></rss>`

describe('createRssFetcher', () => {
  it('GETs the lang-specific /rss.xml URL on the default base', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(xml, { status: 200 }))
    const fetcher = createRssFetcher({ fetch: fetchFn })
    await fetcher('ru')
    expect(fetchFn).toHaveBeenCalledOnce()
    const [url] = fetchFn.mock.calls[0] ?? []
    expect(url).toBe(`${FALLBACK_BASE}/ru/rss.xml`)
  })

  it('honours a custom base URL', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(xml, { status: 200 }))
    const fetcher = createRssFetcher({
      base: 'https://example.test',
      fetch: fetchFn,
    })
    await fetcher('en')
    const [url] = fetchFn.mock.calls[0] ?? []
    expect(url).toBe('https://example.test/en/rss.xml')
  })

  it('returns parsed articles on 2xx', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(xml, { status: 200 }))
    const items = await createRssFetcher({ fetch: fetchFn })('it')
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ guid: 'g1', lang: 'it' })
  })

  it('returns an empty list on a non-2xx response (no throw)', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('not found', { status: 404 }))
    expect(await createRssFetcher({ fetch: fetchFn })('ru')).toEqual([])
  })

  it('returns an empty list when fetch itself rejects', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error('network down'))
    expect(await createRssFetcher({ fetch: fetchFn })('ru')).toEqual([])
  })
})
