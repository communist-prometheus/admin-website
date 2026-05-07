import { describe, expect, it } from 'vitest'
import { pruneEntries } from './ring-buffer'
import type { NavigationEntry } from './types'

const nav = (id: string, ts: number): NavigationEntry => ({
  id,
  ts,
  kind: 'navigation',
  from: '/a',
  to: '/b',
})

describe('pruneEntries', () => {
  const now = 1_000_000_000

  it('returns input unchanged when below both caps', () => {
    const xs = [nav('1', now - 1000), nav('2', now)]
    expect(pruneEntries({ entries: xs, nowMs: now })).toEqual(xs)
  })

  it('drops entries older than maxAge', () => {
    const xs = [nav('old', now - 70 * 60 * 1000), nav('fresh', now - 1000)]
    const out = pruneEntries({ entries: xs, nowMs: now })
    expect(out).toEqual([xs[1]])
  })

  it('drops oldest when count overflows maxEntries', () => {
    const xs = Array.from({ length: 1010 }, (_, i) =>
      nav(String(i), now - i)
    ).reverse()
    const out = pruneEntries({ entries: xs, nowMs: now })
    expect(out).toHaveLength(1000)
    expect(out[0]?.id).toBe('999')
    expect(out[out.length - 1]?.id).toBe('0')
  })

  it('age cutoff and count cap compose — both applied', () => {
    const xs = [
      nav('ancient', now - 90 * 60 * 1000),
      nav('mid', now - 30 * 60 * 1000),
      nav('recent', now - 1000),
    ]
    const out = pruneEntries({
      entries: xs,
      nowMs: now,
      maxEntries: 1,
    })
    expect(out).toEqual([xs[2]])
  })

  it('does not mutate the input array', () => {
    const xs = [nav('1', now)]
    const copy = [...xs]
    pruneEntries({ entries: xs, nowMs: now })
    expect(xs).toEqual(copy)
  })
})
