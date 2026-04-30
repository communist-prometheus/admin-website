import { describe, expect, it } from 'vitest'
import type { SpanRecord } from './otlp-types'
import { buildRbac, canSeeTrace, orgsFromSpans } from './rbac-policy'

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

describe('buildRbac', () => {
  it('parses comma-separated admins', () => {
    const ctx = buildRbac({ RBAC_ADMINS: 'alice, bob ,carol' }, 'alice')
    expect(ctx.user).toBe('alice')
    expect(ctx.admins.has('alice')).toBe(true)
    expect(ctx.admins.has('bob')).toBe(true)
    expect(ctx.admins.has('carol')).toBe(true)
  })

  it('handles missing RBAC_ADMINS', () => {
    const ctx = buildRbac({}, 'alice')
    expect(ctx.admins.size).toBe(0)
  })
})

describe('orgsFromSpans', () => {
  it('collects unique non-empty org attrs', () => {
    const orgs = orgsFromSpans([
      span('a'),
      span('a'),
      span('b'),
      span(undefined),
    ])
    expect([...orgs].sort()).toEqual(['a', 'b'])
  })
})

describe('canSeeTrace', () => {
  it('lets admins see anything', () => {
    const ctx = buildRbac({ RBAC_ADMINS: 'alice' }, 'alice')
    expect(canSeeTrace(ctx, new Set())).toBe(true)
    expect(canSeeTrace(ctx, new Set(['unrelated']))).toBe(true)
  })

  it('lets a non-admin see traces from their own org', () => {
    const ctx = buildRbac({}, 'alice')
    expect(canSeeTrace(ctx, new Set(['alice']))).toBe(true)
    expect(canSeeTrace(ctx, new Set(['bob']))).toBe(false)
  })

  it('denies non-admins on traces with no org metadata', () => {
    const ctx = buildRbac({}, 'alice')
    expect(canSeeTrace(ctx, new Set())).toBe(false)
  })
})
