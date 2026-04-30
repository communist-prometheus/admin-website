import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { emptyFilters } from './search-types'
import { useSavedQueries } from './use-saved-queries'

describe('useSavedQueries', () => {
  beforeEach(() => {
    globalThis.localStorage.clear()
  })
  afterEach(() => {
    globalThis.localStorage.clear()
  })

  it('starts empty when nothing is persisted', () => {
    const handle = useSavedQueries()
    expect(handle.queries.value).toEqual([])
  })

  it('save persists and reloads across instances', () => {
    const a = useSavedQueries()
    a.save('mine', { ...emptyFilters, org: 'me' })
    const b = useSavedQueries()
    expect(b.queries.value).toHaveLength(1)
    expect(b.queries.value[0]?.filters.org).toBe('me')
  })

  it('save replaces an entry with the same name', () => {
    const handle = useSavedQueries()
    handle.save('mine', { ...emptyFilters, org: 'one' })
    handle.save('mine', { ...emptyFilters, org: 'two' })
    expect(handle.queries.value).toHaveLength(1)
    expect(handle.queries.value[0]?.filters.org).toBe('two')
  })

  it('rename updates the name keeping the filters', () => {
    const handle = useSavedQueries()
    handle.save('alpha', { ...emptyFilters, q: 'aa' })
    handle.rename('alpha', 'beta')
    expect(handle.queries.value[0]?.name).toBe('beta')
    expect(handle.queries.value[0]?.filters.q).toBe('aa')
  })

  it('remove drops the named entry', () => {
    const handle = useSavedQueries()
    handle.save('a', emptyFilters)
    handle.save('b', emptyFilters)
    handle.remove('a')
    expect(handle.queries.value.map(q => q.name)).toEqual(['b'])
  })
})
