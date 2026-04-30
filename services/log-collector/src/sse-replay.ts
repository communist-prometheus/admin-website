import type { Context } from 'hono'
import type { SSEStreamingApi } from 'hono/streaming'
import { replay, type SpanFilter } from './sse-bus'
import { writeGap, writeSpanEvent } from './sse-write'

/**
 * Resolve the replay cursor from `Last-Event-ID` (set by the
 * browser EventSource on auto-reconnect) or from the `since`
 * query for first-time clients. Defaults to 0 (no replay).
 * @param c Hono context.
 * @returns Numeric cursor; 0 when missing or malformed.
 */
export const cursorOf = (c: Context): number => {
  const raw = c.req.header('Last-Event-ID') ?? c.req.query('since') ?? '0'
  const n = Number.parseInt(raw, 10)
  return Number.isNaN(n) ? 0 : n
}

/**
 * Replay buffered events newer than `cursor` to the stream.
 * Emits a `gap` event first when older events have rolled off
 * the ring before the cursor.
 * @param stream Hono SSE writer.
 * @param cursor Last seen event id.
 * @param filter Span predicate.
 * @returns Promise that resolves after the backlog is flushed.
 */
export const replayBacklog = async (
  stream: SSEStreamingApi,
  cursor: number,
  filter: SpanFilter
): Promise<void> => {
  const { events, gap, oldestId } = replay(cursor)
  await (gap && oldestId !== undefined
    ? writeGap(stream, oldestId)
    : Promise.resolve())
  await Promise.all(
    events.filter(e => filter(e.span)).map(e => writeSpanEvent(stream, e))
  )
}
