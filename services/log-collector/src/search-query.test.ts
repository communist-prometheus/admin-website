import { describe, expect, it } from 'vitest'
import { parseSearchQuery } from './search-query'

const params = (
  ...kvs: ReadonlyArray<readonly [string, string]>
): URLSearchParams => {
  const u = new URLSearchParams()
  kvs.forEach(([k, v]) => {
    u.set(k, v)
  })
  return u
}

describe('parseSearchQuery', () => {
  it('returns sensible defaults for an empty query', () => {
    const q = parseSearchQuery(new URLSearchParams())
    expect(q.limit).toBe(50)
    expect(q.q).toBeUndefined()
    expect(q.from).toBeUndefined()
    expect(q.to).toBeUndefined()
    expect(q.cursor).toBeUndefined()
    expect(q.status).toBeUndefined()
  })

  it('parses every supported parameter', () => {
    const q = parseSearchQuery(
      params(
        ['q', 'name'],
        ['from', '100'],
        ['to', '200'],
        ['service', 'svc'],
        ['org', 'me'],
        ['repo', 'site'],
        ['status', 'ok'],
        ['cursor', '500'],
        ['limit', '10']
      )
    )
    expect(q.q).toBe('name')
    expect(q.from).toBe(100)
    expect(q.to).toBe(200)
    expect(q.service).toBe('svc')
    expect(q.org).toBe('me')
    expect(q.repo).toBe('site')
    expect(q.status).toBe('ok')
    expect(q.cursor).toBe(500)
    expect(q.limit).toBe(10)
  })

  it('clamps limit to [1, 200] and rejects garbage status', () => {
    expect(parseSearchQuery(params(['limit', '0'])).limit).toBe(1)
    expect(parseSearchQuery(params(['limit', '9999'])).limit).toBe(200)
    expect(parseSearchQuery(params(['limit', 'oops'])).limit).toBe(50)
    expect(parseSearchQuery(params(['status', 'wat'])).status).toBeUndefined()
  })
})
