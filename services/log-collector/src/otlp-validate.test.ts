import { describe, expect, it } from 'vitest'
import { parseLogBatch, parseTraceBatch } from './otlp-validate'

const span = {
  traceId: 't1',
  spanId: 's1',
  parentSpanId: undefined,
  name: 'op',
  startedAt: 1000,
  finishedAt: 1050,
  status: 'ok',
  attributes: { key: 'value' },
}

const log = {
  traceId: 't1',
  spanId: 's1',
  level: 'info',
  message: 'hello',
  at: 1000,
  attributes: { route: '/x' },
}

describe('parseTraceBatch', () => {
  it('returns valid spans verbatim', () => {
    const result = parseTraceBatch({ spans: [span] })
    expect(result).toHaveLength(1)
    expect(result[0]?.spanId).toBe('s1')
    expect(result[0]?.attributes).toEqual({ key: 'value' })
  })

  it('drops malformed spans', () => {
    const result = parseTraceBatch({
      spans: [span, { traceId: 't2' }, null, 42],
    })
    expect(result).toHaveLength(1)
  })

  it('returns [] when shape is wrong', () => {
    expect(parseTraceBatch(undefined)).toEqual([])
    expect(parseTraceBatch({ no: 'spans' })).toEqual([])
    expect(parseTraceBatch({ spans: 'oops' })).toEqual([])
  })

  it('rejects unknown statuses', () => {
    expect(
      parseTraceBatch({ spans: [{ ...span, status: 'weird' }] })
    ).toEqual([])
  })

  it('drops non-string attribute values', () => {
    const result = parseTraceBatch({
      spans: [{ ...span, attributes: { a: 'ok', b: 42 } }],
    })
    expect(result[0]?.attributes).toEqual({ a: 'ok' })
  })
})

describe('parseLogBatch', () => {
  it('returns valid logs verbatim', () => {
    const result = parseLogBatch({ logs: [log] })
    expect(result).toHaveLength(1)
    expect(result[0]?.message).toBe('hello')
  })

  it('rejects unknown levels', () => {
    expect(parseLogBatch({ logs: [{ ...log, level: 'panic' }] })).toEqual([])
  })

  it('treats traceId/spanId as optional', () => {
    const minimal = { ...log, traceId: undefined, spanId: undefined }
    const result = parseLogBatch({ logs: [minimal] })
    expect(result).toHaveLength(1)
    expect(result[0]?.traceId).toBeUndefined()
  })
})
