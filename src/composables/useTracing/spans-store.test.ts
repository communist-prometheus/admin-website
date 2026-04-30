import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearSpans,
  currentSpan,
  finishSpan,
  listAllSpans,
  MAX_SPANS,
  startSpan,
} from './spans-store'

describe('spans store', () => {
  beforeEach(clearSpans)
  afterEach(clearSpans)

  it('start + finish round-trips with monotonic timestamps', () => {
    const s = startSpan('op')
    const finished = finishSpan(s.id)
    expect(finished?.id).toBe(s.id)
    expect(finished?.finishedAt).toBeGreaterThanOrEqual(s.startedAt)
    expect(finished?.status).toBe('ok')
  })

  it('listAll returns oldest-first', () => {
    const a = startSpan('a')
    finishSpan(a.id)
    const b = startSpan('b')
    finishSpan(b.id)
    expect(listAllSpans().map(s => s.name)).toEqual(['a', 'b'])
  })

  it('nested spans pick the correct parent via the active stack', () => {
    const root = startSpan('root')
    const child = startSpan('child', currentSpan())
    expect(child.traceId).toBe(root.traceId)
    expect(child.parentId).toBe(root.id)
    finishSpan(child.id)
    finishSpan(root.id)
  })

  it('eviction caps completed spans at MAX_SPANS', () => {
    const total = MAX_SPANS + 100
    for (let i = 0; i < total; i += 1) {
      const s = startSpan(`op-${i}`)
      finishSpan(s.id)
    }
    expect(listAllSpans()).toHaveLength(MAX_SPANS)
    expect(listAllSpans()[0]?.name).toBe(`op-${total - MAX_SPANS}`)
  })

  it('finish status carries through', () => {
    const s = startSpan('x')
    finishSpan(s.id, 'error')
    expect(listAllSpans()[0]?.status).toBe('error')
  })

  it('currentSpan returns undefined when nothing is active', () => {
    expect(currentSpan()).toBeUndefined()
    const s = startSpan('a')
    expect(currentSpan()?.id).toBe(s.id)
    finishSpan(s.id)
    expect(currentSpan()).toBeUndefined()
  })

  it('finishSpan with an unknown id returns undefined', () => {
    expect(finishSpan('does-not-exist')).toBeUndefined()
    expect(listAllSpans()).toEqual([])
  })

  it('attributes propagate to the finished span', () => {
    const s = startSpan('a', undefined, { foo: 'bar' })
    finishSpan(s.id)
    expect(listAllSpans()[0]?.attributes).toEqual({ foo: 'bar' })
  })
})
