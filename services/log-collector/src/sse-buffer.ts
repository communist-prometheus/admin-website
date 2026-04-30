import type { SpanRecord } from './otlp-types'

/** A broadcast event with a stream-monotonic id and its span. */
export type SpanEvent = {
  readonly id: number
  readonly span: SpanRecord
}

/** Replay buffer cap — older events drop with a `gap` notice. */
export const MAX_BUFFER = 1000

const buffer: SpanEvent[] = []
let nextId = 1

/**
 * Append an event to the ring buffer with a fresh monotonic id
 * and prune the oldest entry once the cap is reached.
 * @param span Span being broadcast.
 * @returns Event with assigned id.
 */
export const append = (span: SpanRecord): SpanEvent => {
  const event: SpanEvent = { id: nextId, span }
  nextId += 1
  buffer.push(event)
  buffer.splice(0, buffer.length > MAX_BUFFER ? 1 : 0)
  return event
}

/**
 * Replay events with id strictly greater than `cursor`. When the
 * cursor predates the oldest buffered id, the caller gets a
 * `gap` flag so it can warn the client about dropped events.
 * @param cursor Last seen event id.
 * @returns Backlog events and a gap flag.
 */
export const replay = (
  cursor: number
): {
  readonly events: ReadonlyArray<SpanEvent>
  readonly gap: boolean
  readonly oldestId: number | undefined
} => {
  const oldestId = buffer[0]?.id
  const gap = cursor > 0 && oldestId !== undefined && cursor < oldestId - 1
  const events = buffer.filter(e => e.id > cursor)
  return { events, gap, oldestId }
}

/** Reset the buffer — used by tests to isolate fixtures. */
export const resetBuffer = (): void => {
  buffer.length = 0
  nextId = 1
}
