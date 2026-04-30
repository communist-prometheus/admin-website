import { describe, expect, it } from 'vitest'
import type { LogEntry } from '@/sw/protocol'
import { logFromSWEntry } from './log-from-sw'

const baseEntry: LogEntry = {
  ts: 1700000000,
  level: 'info',
  cat: 'git',
  msg: 'fetched',
  spanId: 'abcd',
}

describe('logFromSWEntry', () => {
  it('maps SW fields into a collector LogRecord', () => {
    const out = logFromSWEntry(baseEntry)
    expect(out.message).toBe('fetched')
    expect(out.level).toBe('info')
    expect(out.spanId).toBe('abcd')
    expect(out.at).toBe(1700000000)
    expect(out.attributes['cat']).toBe('git')
    expect(out.traceId).toBeUndefined()
  })

  it('passes the SW-stamped traceId through', () => {
    const out = logFromSWEntry({ ...baseEntry, traceId: 'tttt' })
    expect(out.traceId).toBe('tttt')
  })

  it('flattens data fields into stringified attributes', () => {
    const out = logFromSWEntry({
      ...baseEntry,
      data: { url: 'https://x', count: 42, ok: true },
    })
    expect(out.attributes['url']).toBe('https://x')
    expect(out.attributes['count']).toBe('42')
    expect(out.attributes['ok']).toBe('true')
  })

  it('omits data attributes when entry has none', () => {
    const out = logFromSWEntry(baseEntry)
    expect(Object.keys(out.attributes)).toEqual(['cat'])
  })
})
