import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import type { RemoteSpan } from '@/composables/useTracing/remote-span'
import { useLiveSpans } from './use-live-spans'

const span = (id: string, traceId = 't1'): RemoteSpan => ({
  traceId,
  spanId: id,
  parentSpanId: undefined,
  name: 'op',
  startedAt: 1,
  finishedAt: 2,
  status: 'ok',
  attributes: {},
})

describe('useLiveSpans', () => {
  it('mirrors incoming remote spans into local Span shape', () => {
    const remote = ref<ReadonlyArray<RemoteSpan>>([span('a'), span('b')])
    const live = useLiveSpans(remote)
    expect(live.spans.value.map(s => s.id)).toEqual(['a', 'b'])
  })

  it('pause holds the buffer; new spans do not propagate', () => {
    const remote = ref<ReadonlyArray<RemoteSpan>>([span('a')])
    const live = useLiveSpans(remote)
    live.pause()
    remote.value = [span('a'), span('b')]
    expect(live.spans.value.map(s => s.id)).toEqual(['a'])
  })

  it('resume re-syncs to the latest remote snapshot', () => {
    const remote = ref<ReadonlyArray<RemoteSpan>>([span('a')])
    const live = useLiveSpans(remote)
    live.pause()
    remote.value = [span('a'), span('b'), span('c')]
    live.resume()
    expect(live.spans.value.map(s => s.id)).toEqual(['a', 'b', 'c'])
  })

  it('clear empties the buffer without affecting the upstream', () => {
    const remote = ref<ReadonlyArray<RemoteSpan>>([span('a')])
    const live = useLiveSpans(remote)
    live.clear()
    expect(live.spans.value).toEqual([])
    expect(remote.value).toHaveLength(1)
  })
})
