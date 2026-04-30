import type { Ref } from 'vue'
import type { RemoteSpan } from '@/composables/useTracing/remote-span'
import { remoteToSpan } from '@/composables/useTracing/remote-to-span'
import type { Span } from '@/composables/useTracing/span-types'

/** Pause / resume / clear callbacks the panel toolbar binds to. */
export type LiveSpanHandlers = {
  readonly pause: () => void
  readonly resume: () => void
  readonly clear: () => void
}

/**
 * Build the handler trio that drives the live-spans buffer.
 * Sharing the upstream `remote` ref means resume re-syncs to
 * the latest snapshot without bouncing the SSE connection.
 * @param remote Reactive remote spans from `useTraceStream`.
 * @param buffered Buffer of mapped local spans (mutated in place).
 * @param paused Flag controlling whether the watch propagates.
 * @returns Handler trio.
 */
export const buildHandlers = (
  remote: Ref<ReadonlyArray<RemoteSpan>>,
  buffered: Ref<ReadonlyArray<Span>>,
  paused: Ref<boolean>
): LiveSpanHandlers => ({
  pause: () => {
    paused.value = true
  },
  resume: () => {
    paused.value = false
    buffered.value = remote.value.map(remoteToSpan)
  },
  clear: () => {
    buffered.value = []
  },
})
