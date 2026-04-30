import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { RemoteSpan, TraceStreamStatus } from './remote-span'
import { runLoop } from './trace-stream-loop'

const span: RemoteSpan = {
  traceId: 't1',
  spanId: 's1',
  parentSpanId: undefined,
  name: 'op',
  startedAt: 1,
  finishedAt: 2,
  status: 'ok',
  attributes: {},
}

const sseFrame = (id: number, body: RemoteSpan): string =>
  `id: ${id}\ndata: ${JSON.stringify({ kind: 'span', span: body })}\n\n`

const streamFrom = (text: string): ReadableStream<Uint8Array> => {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text))
      controller.close()
    },
  })
}

describe('runLoop', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(streamFrom(sseFrame(7, span))))
    )
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('appends incoming spans to the reactive store', async () => {
    const spans = ref<ReadonlyArray<RemoteSpan>>([])
    const status = ref<TraceStreamStatus>('connecting')
    const cursor = ref<string | undefined>(undefined)
    const ctrl = new AbortController()
    const loop = runLoop(
      'https://x/v1/subscribe',
      spans,
      status,
      cursor,
      ctrl.signal
    )
    await new Promise(r => setTimeout(r, 30))
    ctrl.abort()
    await loop
    expect(spans.value).toHaveLength(1)
    expect(spans.value[0]?.traceId).toBe('t1')
    expect(cursor.value).toBe('7')
    expect(status.value).toBe('closed')
  })

  it('sends Last-Event-ID on reconnect', async () => {
    const spans = ref<ReadonlyArray<RemoteSpan>>([])
    const status = ref<TraceStreamStatus>('connecting')
    const cursor = ref<string | undefined>('42')
    const ctrl = new AbortController()
    const loop = runLoop(
      'https://x/v1/subscribe',
      spans,
      status,
      cursor,
      ctrl.signal
    )
    await new Promise(r => setTimeout(r, 10))
    ctrl.abort()
    await loop
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>
    const init = fetchMock.mock.calls[0]?.[1]
    expect(init?.headers?.['Last-Event-ID']).toBe('42')
  })
})
