import type { SSEStreamingApi } from 'hono/streaming'
import type { SpanEvent, SpanFilter } from './sse-bus'

/**
 * Write a span event to the SSE stream as a normal event with
 * an `id:` so EventSource auto-reconnect can use Last-Event-ID.
 * @param stream Hono SSE writer.
 * @param event Buffered span event.
 * @returns Promise that resolves once the chunk is flushed.
 */
export const writeSpanEvent = (
  stream: SSEStreamingApi,
  event: SpanEvent
): Promise<void> =>
  stream.writeSSE({
    id: String(event.id),
    data: JSON.stringify({ kind: 'span', span: event.span }),
  })

/**
 * Emit a `gap` event so a reconnecting client knows that some
 * events fell off the buffer before the cursor it sent.
 * @param stream Hono SSE writer.
 * @param oldestId Lowest id still in the buffer.
 * @returns Promise that resolves once the chunk is flushed.
 */
export const writeGap = (
  stream: SSEStreamingApi,
  oldestId: number
): Promise<void> =>
  stream.writeSSE({
    event: 'gap',
    data: JSON.stringify({ droppedBefore: oldestId }),
  })

/**
 * Wrap a filter into a subscriber that writes events to the
 * SSE stream. Returns the subscriber object directly so the
 * caller hooks it into `subscribe`.
 * @param stream Hono SSE writer.
 * @param filter Span predicate.
 * @returns Send callback that writes filtered events.
 */
export const sendToStream =
  (
    stream: SSEStreamingApi,
    filter: SpanFilter
  ): ((event: SpanEvent) => void) =>
  event => {
    const fire = filter(event.span)
      ? () => writeSpanEvent(stream, event)
      : (): Promise<void> => Promise.resolve()
    void fire()
  }
