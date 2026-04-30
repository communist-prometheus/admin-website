import type { HttpClient } from 'isomorphic-git'
import { activeContext } from './active-context'

const traceparentHeader = (): Record<string, string> => {
  const ctx = activeContext()
  return ctx === undefined
    ? {}
    : { traceparent: `00-${ctx.traceId}-${ctx.spanId}-01` }
}

/**
 * Wrap an isomorphic-git HTTP client so every outbound request
 * carries the active SW trace context as a W3C `traceparent`
 * header. No-op when no context is active.
 * @param inner Underlying HTTP client (web or node flavour).
 * @returns Wrapped client with header injection.
 */
export const withTraceparent = (inner: HttpClient): HttpClient => ({
  request: async opts =>
    inner.request({
      ...opts,
      headers: { ...opts.headers, ...traceparentHeader() },
    }),
})
