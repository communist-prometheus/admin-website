import { randomHex } from './random-hex'
import type { Span } from './span-types'
import { newRootTraceparent } from './traceparent'

/**
 * Build a fresh started span. Reused by the spans-store start
 * action — extracted so the store stays under the max-lines
 * budget and the helper can be unit-tested in isolation.
 * @param name Operation name (e.g. `git.push`).
 * @param parent Enclosing span, or undefined for a new trace root.
 * @param attributes Attribute map shipped with the span.
 * @returns Started span with `finishedAt` undefined.
 */
export const buildStartedSpan = (
  name: string,
  parent: Span | undefined,
  attributes: Readonly<Record<string, string>>
): Span => ({
  id: randomHex(8),
  traceId: parent?.traceId ?? newRootTraceparent().traceId,
  parentId: parent?.id,
  name,
  startedAt: Date.now(),
  finishedAt: undefined,
  attributes,
  status: 'unset',
})
