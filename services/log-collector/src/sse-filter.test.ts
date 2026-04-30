import { describe, expect, it } from 'vitest'
import type { SpanRecord } from './otlp-types'
import { buildRbac } from './rbac-policy'
import { composeFilters, rbacFilter, traceIdFilter } from './sse-filter'

const span = (org: string | undefined): SpanRecord => ({
  traceId: 't',
  spanId: 's',
  parentSpanId: undefined,
  name: 'op',
  startedAt: 1,
  finishedAt: 2,
  status: 'ok',
  attributes: org === undefined ? {} : { org },
})

describe('traceIdFilter', () => {
  it('matches every span when no id is set', () => {
    expect(traceIdFilter(undefined)(span('a'))).toBe(true)
  })
  it('only matches the requested trace id', () => {
    const filter = traceIdFilter('t')
    expect(filter(span('a'))).toBe(true)
    expect(filter({ ...span('a'), traceId: 'other' })).toBe(false)
  })
})

describe('rbacFilter', () => {
  it('lets admins through everything', () => {
    const ctx = buildRbac({ RBAC_ADMINS: 'alice' }, 'alice')
    const filter = rbacFilter(ctx)
    expect(filter(span(undefined))).toBe(true)
    expect(filter(span('foreign'))).toBe(true)
  })
  it('drops foreign-org spans for non-admins', () => {
    const ctx = buildRbac({}, 'alice')
    const filter = rbacFilter(ctx)
    expect(filter(span('alice'))).toBe(true)
    expect(filter(span('bob'))).toBe(false)
    expect(filter(span(undefined))).toBe(false)
  })
})

describe('composeFilters', () => {
  it('AND-combines two predicates', () => {
    const yes: () => true = () => true
    const no: () => false = () => false
    expect(composeFilters(yes, yes)(span('a'))).toBe(true)
    expect(composeFilters(yes, no)(span('a'))).toBe(false)
    expect(composeFilters(no, yes)(span('a'))).toBe(false)
  })
})
