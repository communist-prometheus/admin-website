import { beforeEach, describe, expect, it, vi } from 'vitest'
import { dedupPending, scheduleReplace } from './dedup-pending'
import type { PendingAsset } from './types'

const pendingOf = (name: string, blobUrl = `blob:${name}`): PendingAsset => ({
  name,
  base64: 'data',
  mimeType: 'image/png',
  blobUrl,
})

describe('dedupPending', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      ...URL,
      revokeObjectURL: vi.fn(),
    })
  })

  it('returns input unchanged when no match', () => {
    const out = dedupPending(
      [pendingOf('a.png'), pendingOf('b.png')],
      'c.png'
    )
    expect(out.map(p => p.name)).toEqual(['a.png', 'b.png'])
  })

  it('drops matching name and revokes its blob url', () => {
    const a = pendingOf('a.png', 'blob:a-old')
    const b = pendingOf('b.png')
    const out = dedupPending([a, b], 'a.png')
    expect(out.map(p => p.name)).toEqual(['b.png'])
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a-old')
  })

  it('drops every match (multiple stale entries)', () => {
    const a1 = pendingOf('dup.png', 'blob:a-1')
    const a2 = pendingOf('dup.png', 'blob:a-2')
    const out = dedupPending([a1, a2, pendingOf('keep.png')], 'dup.png')
    expect(out.map(p => p.name)).toEqual(['keep.png'])
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a-1')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a-2')
  })
})

describe('scheduleReplace', () => {
  it('returns the same set when committedPath is undefined', () => {
    const set = new Set<string>()
    expect(scheduleReplace(set, undefined)).toBe(set)
  })

  it('adds committedPath when missing', () => {
    const out = scheduleReplace(new Set<string>(), 'a/b.png')
    expect(out.has('a/b.png')).toBe(true)
  })

  it('returns the same set when path already present (idempotent)', () => {
    const set = new Set<string>(['a/b.png'])
    expect(scheduleReplace(set, 'a/b.png')).toBe(set)
  })

  it('keeps existing entries when adding a new one', () => {
    const set = new Set<string>(['x.pdf'])
    const out = scheduleReplace(set, 'y.pdf')
    expect([...out].sort()).toEqual(['x.pdf', 'y.pdf'])
  })
})
