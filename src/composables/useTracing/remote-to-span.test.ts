import { describe, expect, it } from 'vitest'
import type { RemoteSpan } from './remote-span'
import { remoteToSpan } from './remote-to-span'

const remote: RemoteSpan = {
  traceId: 't1',
  spanId: 's1',
  parentSpanId: 'p1',
  name: 'op',
  startedAt: 100,
  finishedAt: 250,
  status: 'ok',
  attributes: { service: 'sw' },
}

describe('remoteToSpan', () => {
  it('renames spanId / parentSpanId to id / parentId', () => {
    const local = remoteToSpan(remote)
    expect(local.id).toBe('s1')
    expect(local.parentId).toBe('p1')
    expect(local.traceId).toBe('t1')
    expect(local.name).toBe('op')
    expect(local.startedAt).toBe(100)
    expect(local.finishedAt).toBe(250)
    expect(local.status).toBe('ok')
    expect(local.attributes).toEqual({ service: 'sw' })
  })

  it('passes a missing parent through as undefined', () => {
    const local = remoteToSpan({ ...remote, parentSpanId: undefined })
    expect(local.parentId).toBeUndefined()
  })
})
