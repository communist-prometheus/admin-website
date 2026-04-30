import { describe, expect, it } from 'vitest'
import { parseSearchQuery } from './search-query'
import { buildWhere } from './search-sql'

describe('buildWhere', () => {
  it('emits the no-op clause when the query is empty', () => {
    const where = buildWhere(parseSearchQuery(new URLSearchParams()))
    expect(where.sql).toMatch(/1=1/)
    expect(where.bind).toEqual([])
  })

  it('binds equality filters in order', () => {
    const url = new URLSearchParams()
    url.set('status', 'error')
    url.set('org', 'me')
    url.set('repo', 'site')
    const where = buildWhere(parseSearchQuery(url))
    expect(where.sql).toContain('status = ?')
    expect(where.sql).toContain("json_extract(attrs, '$.org') = ?")
    expect(where.sql).toContain("json_extract(attrs, '$.repo') = ?")
    expect(where.bind).toEqual(['error', 'me', 'site'])
  })

  it('binds the cursor + range bounds', () => {
    const url = new URLSearchParams()
    url.set('from', '10')
    url.set('to', '20')
    url.set('cursor', '500')
    const where = buildWhere(parseSearchQuery(url))
    expect(where.bind).toEqual([10, 20, 500])
    expect(where.sql).toContain('started_at >= ?')
    expect(where.sql).toContain('started_at <= ?')
    expect(where.sql).toContain('started_at < ?')
  })

  it('passes free-text q via LIKE with wildcard wrapping', () => {
    const url = new URLSearchParams()
    url.set('q', 'git.push')
    const where = buildWhere(parseSearchQuery(url))
    expect(where.sql).toContain('name LIKE ?')
    expect(where.bind[0]).toBe('%git.push%')
  })
})
