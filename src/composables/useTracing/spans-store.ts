import { buildStartedSpan } from './span-builder'
import type { Span, SpanStatus } from './span-types'

/** Maximum spans retained in the in-memory ring. */
export const MAX_SPANS = 500

let active: Span[] = []
let completed: Span[] = []

const evictOldest = (): void => {
  completed = completed.slice(Math.max(0, completed.length - MAX_SPANS))
}

/**
 * Start a new span. Pushes onto the active stack so `currentSpan`
 * returns it; root spans get a fresh trace-id, child spans inherit.
 * @param name Operation name (e.g. `git.push`).
 * @param parent Enclosing span, or undefined for a new trace root.
 * @param attributes Attribute map shipped with the span.
 * @returns The freshly started span.
 */
export const startSpan = (
  name: string,
  parent?: Span,
  attributes: Readonly<Record<string, string>> = {}
): Span => {
  const span = buildStartedSpan(name, parent, attributes)
  active = [...active, span]
  return span
}

/**
 * Finish a previously-started span. Removes it from the active
 * stack and appends to the completed ring (FIFO eviction).
 * @param id Span id returned by `startSpan`.
 * @param status Final status, defaults to `ok`.
 * @returns Finished span, or undefined when the id is unknown.
 */
export const finishSpan = (
  id: string,
  status: SpanStatus = 'ok'
): Span | undefined => {
  const found = active.find(s => s.id === id)
  active = active.filter(s => s.id !== id)
  const finished =
    found === undefined
      ? undefined
      : { ...found, finishedAt: Date.now(), status }
  completed = finished === undefined ? completed : [...completed, finished]
  evictOldest()
  return finished
}

/**
 * Top of the active stack — most recent span that has not yet
 * finished. Returns undefined when no span is active.
 * @returns Active span at the top of the stack.
 */
export const currentSpan = (): Span | undefined => active[active.length - 1]

/**
 * Snapshot of completed spans, oldest-first. Used by the dev
 * overlay (5.4) and the future exporter (Epic 7).
 * @returns Frozen array of finished spans.
 */
export const listAllSpans = (): readonly Span[] => [...completed]

/** Clear every recorded span. Used by tests and the dev overlay. */
export const clearSpans = (): void => {
  active = []
  completed = []
}
