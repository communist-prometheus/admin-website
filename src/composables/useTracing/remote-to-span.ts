import type { RemoteSpan } from './remote-span'
import type { Span } from './span-types'

/**
 * Adapt a collector-shaped `RemoteSpan` into the local `Span`
 * shape used by `TraceList` / `TraceWaterfall`. Maps `spanId`
 * to `id` and `parentSpanId` to `parentId`.
 * @param remote Remote span from the SSE stream.
 * @returns Local span suitable for the existing overlay UI.
 */
export const remoteToSpan = (remote: RemoteSpan): Span => ({
  id: remote.spanId,
  traceId: remote.traceId,
  parentId: remote.parentSpanId,
  name: remote.name,
  startedAt: remote.startedAt,
  finishedAt: remote.finishedAt,
  attributes: remote.attributes,
  status: remote.status,
})
