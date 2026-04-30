import type { SpanRecord } from './otlp-types'

/** Predicate that decides whether a subscriber receives a span. */
export type SpanFilter = (span: SpanRecord) => boolean

/** A live subscriber: filter + send callback. */
export type Subscriber = {
  readonly filter: SpanFilter
  readonly send: (span: SpanRecord) => void
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

const fanout = (sub: Subscriber, span: SpanRecord): void => {
  const send = sub.filter(span) ? () => sub.send(span) : (): void => undefined
  send()
}

/**
 * Fan out a span to every matching subscriber. No-op when the
 * registry is empty so ingest stays cheap when no one is
 * watching.
 * @param span Span to broadcast.
 * @returns void
 */
export const broadcast = (span: SpanRecord): void => {
  subscribers.forEach(sub => {
    fanout(sub, span)
  })
}

/**
 * Snapshot of active subscriber count — used by tests and the
 * future health endpoint.
 * @returns Number of active subscribers.
 */
export const subscriberCount = (): number => subscribers.size
