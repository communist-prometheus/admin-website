import { describe, expect, it } from 'vitest'
import { parseChunk } from './sse-parse'

describe('parseChunk', () => {
  it('parses a single record terminated by a blank line', () => {
    const { records, leftover } = parseChunk(
      '',
      'id: 5\ndata: {"hello":"world"}\n\n'
    )
    expect(records).toHaveLength(1)
    expect(records[0]?.id).toBe('5')
    expect(records[0]?.data).toBe('{"hello":"world"}')
    expect(leftover).toBe('')
  })

  it('parses multiple records in one chunk', () => {
    const wire = 'id: 1\ndata: a\n\nid: 2\ndata: b\n\n'
    const { records } = parseChunk('', wire)
    expect(records.map(r => r.id)).toEqual(['1', '2'])
  })

  it('keeps leftover when a record is split across chunks', () => {
    const a = parseChunk('', 'id: 7\ndata: par')
    expect(a.records).toHaveLength(0)
    const b = parseChunk(a.leftover, 'tial\n\n')
    expect(b.records).toHaveLength(1)
    expect(b.records[0]?.data).toBe('partial')
  })

  it('skips comment lines', () => {
    const { records } = parseChunk('', ': heartbeat\n\nid: 3\ndata: x\n\n')
    expect(records.map(r => r.id)).toEqual(['3'])
  })

  it('honours the event field', () => {
    const { records } = parseChunk(
      '',
      'event: gap\ndata: {"droppedBefore":1}\n\n'
    )
    expect(records[0]?.event).toBe('gap')
  })
})
