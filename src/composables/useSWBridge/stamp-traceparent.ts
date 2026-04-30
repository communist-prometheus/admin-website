import { currentSpan } from '@/composables/useTracing/spans-store'
import { serialise } from '@/composables/useTracing/traceparent'
import type { SWRequest } from '@/sw/protocol'

/**
 * Stamp the outgoing SW message with the active client span's
 * traceparent so the SW dispatcher can install a matching trace
 * context. No-op when no client span is active.
 * @param message Request to stamp.
 * @returns Message with `traceparent` populated, or the input.
 */
export const stampTraceparent = <T extends SWRequest>(
  message: T
): T & { readonly traceparent?: string } => {
  const span = currentSpan()
  return span === undefined
    ? message
    : {
        ...message,
        traceparent: serialise({
          version: '00',
          traceId: span.traceId,
          parentId: span.id,
          sampled: true,
        }),
      }
}
