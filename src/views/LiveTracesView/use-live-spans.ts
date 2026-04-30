import { computed, type Ref, ref, watch } from 'vue'
import type { RemoteSpan } from '@/composables/useTracing/remote-span'
import { remoteToSpan } from '@/composables/useTracing/remote-to-span'
import type { Span } from '@/composables/useTracing/span-types'
import { buildHandlers, type LiveSpanHandlers } from './live-spans-handlers'

/** Reactive surface returned by `useLiveSpans`. */
export type LiveSpansHandle = LiveSpanHandlers & {
  readonly spans: Ref<ReadonlyArray<Span>>
  readonly paused: Ref<boolean>
}

const wireMirror = (
  remote: Ref<ReadonlyArray<RemoteSpan>>,
  buffered: Ref<ReadonlyArray<Span>>,
  paused: Ref<boolean>
): void => {
  watch(
    remote,
    next => {
      const adopt = paused.value
        ? () => undefined
        : () => {
            buffered.value = next.map(remoteToSpan)
          }
      adopt()
    },
    { immediate: true }
  )
}

/**
 * Mirror an upstream `RemoteSpan` ref into local `Span` shape and
 * expose pause / resume / clear without tearing down the SSE
 * connection. Pause holds the buffer; resume re-syncs to the
 * latest snapshot; clear empties the buffer (upstream ref
 * untouched).
 * @param remote Reactive ref of remote spans.
 * @returns Buffered spans + paused flag + handlers.
 */
export const useLiveSpans = (
  remote: Ref<ReadonlyArray<RemoteSpan>>
): LiveSpansHandle => {
  const buffered = ref<ReadonlyArray<Span>>([])
  const paused = ref(false)
  wireMirror(remote, buffered, paused)
  return {
    spans: computed(() => buffered.value),
    paused,
    ...buildHandlers(remote, buffered, paused),
  }
}
