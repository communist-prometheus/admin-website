import { describe, expect, it } from 'vitest'
import { filtersToQuery } from './filters-to-query'
import { emptyFilters } from './search-types'

describe('filtersToQuery', () => {
  it('emits only the limit when filters are empty', () => {
    const out = filtersToQuery(emptyFilters)
    expect([...out.entries()]).toEqual([['limit', '50']])
  })

  it('passes free text + org/repo through unchanged', () => {
    const out = filtersToQuery({
      ...emptyFilters,
      q: 'git',
      org: 'me',
      repo: 'site',
    })
    expect(out.get('q')).toBe('git')
    expect(out.get('org')).toBe('me')
    expect(out.get('repo')).toBe('site')
  })

  it('converts ISO date inputs to epoch ms', () => {
    const out = filtersToQuery({
      ...emptyFilters,
      from: '2026-01-01T00:00:00Z',
      to: '2026-01-02T00:00:00Z',
    })
    expect(out.get('from')).toBe(String(Date.parse('2026-01-01T00:00:00Z')))
    expect(out.get('to')).toBe(String(Date.parse('2026-01-02T00:00:00Z')))
  })

  it('emits cursor when provided', () => {
    const out = filtersToQuery(emptyFilters, 1234, 25)
    expect(out.get('cursor')).toBe('1234')
    expect(out.get('limit')).toBe('25')
  })
})
