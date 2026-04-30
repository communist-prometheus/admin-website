import { describe, expect, it } from 'vitest'
import type { RemoteSpan } from './remote-span'
import { recordToSpan } from './trace-stream-record'

const valid: RemoteSpan = {
  traceId: 't1',
  spanId: 's1',
  parentSpanId: undefined,
  name: 'op',
  startedAt: 1,
  finishedAt: 2,
  status: 'ok',
  attributes: {},
}

describe('recordToSpan', () => {
  it('decodes a span payload', () => {
    const out = recordToSpan({
      id: '1',
      event: undefined,
      data: JSON.stringify({ kind: 'span', span: valid }),
    })
    expect(out?.traceId).toBe('t1')
  })

  it('returns undefined for non-span payloads', () => {
    const out = recordToSpan({
      id: undefined,
      event: 'gap',
      data: JSON.stringify({ droppedBefore: 5 }),
    })
    expect(out).toBeUndefined()
  })

  it('returns undefined for malformed JSON', () => {
    expect(
      recordToSpan({ id: undefined, event: undefined, data: 'not-json' })
    ).toBeUndefined()
  })

  it('rejects payloads missing required fields', () => {
    const out = recordToSpan({
      id: '1',
      event: undefined,
      data: JSON.stringify({ kind: 'span', span: { traceId: 't1' } }),
    })
    expect(out).toBeUndefined()
  })
})
