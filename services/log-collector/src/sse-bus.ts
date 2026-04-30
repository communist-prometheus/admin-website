import type { SpanRecord } from './otlp-types'
import { append, resetBuffer, type SpanEvent } from './sse-buffer'

export type { SpanEvent } from './sse-buffer'
export { MAX_BUFFER, replay } from './sse-buffer'

/** Predicate that decides whether a subscriber receives an event. */
export type SpanFilter = (span: SpanRecord) => boolean

/** A live subscriber: filter + send callback. */
export type Subscriber = {
  readonly filter: SpanFilter
  readonly send: (event: SpanEvent) => void
}

const subscribers = new Set<Subscriber>()

/**
 * Register a subscriber. Returns a disposer that removes the
 * subscriber when the stream closes or the client aborts.
 * @param sub Subscriber filter + sink.
 * @returns Disposer.
 */
export const subscribe = (sub: Subscriber): (() => void) => {
  subscribers.add(sub)
  return () => {
    subscribers.delete(sub)
  }
}

const fanout = (sub: Subscriber, event: SpanEvent): void => {
  const send = sub.filter(event.span)
    ? () => sub.send(event)
    : (): void => undefined
  send()
}

/**
 * Append a span to the replay buffer and fan it out to every
 * matching subscriber. Returns the freshly assigned event id so
 * callers (e.g. ingest handlers) can echo it for diagnostics.
 * @param span Span to broadcast.
 * @returns Event id assigned by the buffer.
 */
export const broadcast = (span: SpanRecord): number => {
  const event = append(span)
  subscribers.forEach(sub => {
    fanout(sub, event)
  })
  return event.id
}

/** Reset the bus — used by tests to isolate fixtures. */
export const resetSseBus = (): void => {
  subscribers.clear()
  resetBuffer()
}

/**
 * Snapshot of active subscriber count — used by tests and the
 * future health endpoint.
 * @returns Number of active subscribers.
 */
export const subscriberCount = (): number => subscribers.size
