import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/*
 * Reproducer for the prod incident on 2026-05-07: pdfjs 5.6.205 calls
 * `this[#fr].getOrInsertComputed(...)` on its private font registry
 * Map. On engines that haven't shipped TC39 "Map upserts" yet the
 * upload throws "this[#fr].getOrInsertComputed is not a function"
 * and cover extraction silently fails for editors. The polyfill
 * must install the method on both Map and WeakMap prototypes so any
 * call site (private field or otherwise) works.
 */

interface Removable {
  readonly mapHad: boolean
  readonly weakHad: boolean
}

const stripPolyfill = (): Removable => {
  const mapProto = Map.prototype
  const weakProto = WeakMap.prototype
  const mapHad = typeof mapProto.getOrInsertComputed === 'function'
  const weakHad = typeof weakProto.getOrInsertComputed === 'function'
  Reflect.deleteProperty(mapProto, 'getOrInsertComputed')
  Reflect.deleteProperty(weakProto, 'getOrInsertComputed')
  return { mapHad, weakHad }
}

const restoreNative = (had: Removable): void => {
  if (!had.mapHad)
    Reflect.deleteProperty(Map.prototype, 'getOrInsertComputed')
  if (!had.weakHad)
    Reflect.deleteProperty(WeakMap.prototype, 'getOrInsertComputed')
}

describe('map-upsert polyfill', () => {
  let snapshot: Removable

  beforeEach(() => {
    vi.resetModules()
    snapshot = stripPolyfill()
  })

  afterEach(() => {
    restoreNative(snapshot)
  })

  it('without the polyfill, calling getOrInsertComputed throws', () => {
    const m = new Map<string, number>()
    expect(() => {
      // Mirrors what pdfjs does on its private font-registry map.
      // biome-ignore lint/suspicious/noExplicitAny: the whole point is to assert the method is missing
      ;(m as any).getOrInsertComputed('k', () => 1)
    }).toThrow()
  })

  it('after installing the polyfill, Map.getOrInsertComputed inserts on miss', async () => {
    const { ensureMapUpsertPolyfill } = await import('./map-upsert-polyfill')
    ensureMapUpsertPolyfill()
    const m = new Map<string, number>()
    let calls = 0
    const v = m.getOrInsertComputed('answer', () => {
      calls++
      return 42
    })
    expect(v).toBe(42)
    expect(m.get('answer')).toBe(42)
    expect(calls).toBe(1)
  })

  it('after installing, getOrInsertComputed returns the existing value on hit and does NOT re-run the factory', async () => {
    const { ensureMapUpsertPolyfill } = await import('./map-upsert-polyfill')
    ensureMapUpsertPolyfill()
    const m = new Map<string, number>([['k', 7]])
    let calls = 0
    const v = m.getOrInsertComputed('k', () => {
      calls++
      return 99
    })
    expect(v).toBe(7)
    expect(calls).toBe(0)
  })

  it('also patches WeakMap', async () => {
    const { ensureMapUpsertPolyfill } = await import('./map-upsert-polyfill')
    ensureMapUpsertPolyfill()
    const wm = new WeakMap<object, string>()
    const k = {}
    const v = wm.getOrInsertComputed(k, () => 'hello')
    expect(v).toBe('hello')
    expect(wm.get(k)).toBe('hello')
  })

  it('idempotent: subsequent calls are no-ops if the method exists', async () => {
    const { ensureMapUpsertPolyfill } = await import('./map-upsert-polyfill')
    ensureMapUpsertPolyfill()
    const first = Map.prototype.getOrInsertComputed
    ensureMapUpsertPolyfill()
    expect(Map.prototype.getOrInsertComputed).toBe(first)
  })
})
