import type { TraceContext } from './active-context'

const TRACEPARENT_RE = /^00-[0-9a-f]{32}-[0-9a-f]{16}-(00|01)$/

/**
 * Parse a W3C `traceparent` header into a SW trace context.
 * Returns undefined for malformed input so callers fall back
 * to a missing-context state rather than crashing.
 * @param raw Wire-format traceparent string.
 * @returns Trace context, or undefined when invalid.
 */
export const parseTraceparent = (
  raw: string | undefined
): TraceContext | undefined => {
  const ok = typeof raw === 'string' && TRACEPARENT_RE.test(raw)
  const parts = ok ? raw.split('-') : []
  return parts.length === 4 &&
    parts[1] !== undefined &&
    parts[2] !== undefined
    ? { traceId: parts[1], spanId: parts[2] }
    : undefined
}
