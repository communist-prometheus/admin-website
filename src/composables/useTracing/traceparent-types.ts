/**
 * Decomposed W3C traceparent value. The `version` is fixed at
 * `'00'` for the foreseeable future per the W3C spec.
 */
export type Traceparent = {
  readonly version: '00'
  readonly traceId: string
  readonly parentId: string
  readonly sampled: boolean
}

/** Validation regex for the serialised W3C traceparent string. */
export const TRACEPARENT_RE =
  /^[0-9a-f]{2}-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/
