import { randomHex } from './random-hex'
import { TRACEPARENT_RE, type Traceparent } from './traceparent-types'

const flagOf = (sampled: boolean): string => (sampled ? '01' : '00')

/**
 * Build a fresh root traceparent (new traceId + parentId). Sampled
 * by default — the upstream collector applies head-based sampling
 * later, so all locally generated traces are eligible to ship.
 * @param sampled Whether the trace should carry the sampled flag.
 * @returns Decomposed traceparent ready to serialise.
 */
export const newRootTraceparent = (sampled = true): Traceparent => ({
  version: '00',
  traceId: randomHex(16),
  parentId: randomHex(8),
  sampled,
})

/**
 * Build a child traceparent that inherits the trace-id from the
 * parent and gets a fresh span-id. Used when continuing a trace
 * across boundaries (client → SW → fetch).
 * @param parent Existing parent traceparent.
 * @returns Child traceparent with a new parentId.
 */
export const childOf = (parent: Traceparent): Traceparent => ({
  ...parent,
  parentId: randomHex(8),
})

/**
 * Serialise a decomposed traceparent into the W3C wire format
 * `version-traceId-parentId-flags` so it can be set as a request
 * header or BroadcastChannel envelope field.
 * @param tp Decomposed traceparent.
 * @returns Wire-format string.
 */
export const serialise = (tp: Traceparent): string =>
  `${tp.version}-${tp.traceId}-${tp.parentId}-${flagOf(tp.sampled)}`

/**
 * Parse a W3C traceparent string back into the decomposed form.
 * Returns undefined for malformed input so callers can fall back
 * to a fresh root rather than crash.
 * @param raw Wire-format string.
 * @returns Decomposed traceparent, or undefined when invalid.
 */
export const parse = (raw: string): Traceparent | undefined => {
  const match = TRACEPARENT_RE.test(raw)
  const parts = match ? raw.split('-') : []
  return parts.length === 4 && parts[0] === '00'
    ? {
        version: '00',
        traceId: parts[1] ?? '',
        parentId: parts[2] ?? '',
        sampled: parts[3] === '01',
      }
    : undefined
}
