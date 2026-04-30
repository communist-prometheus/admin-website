import { onUnmounted, type Ref, ref } from 'vue'
import type { RemoteSpan, TraceStreamStatus } from './remote-span'
import { runLoop } from './trace-stream-loop'
import { subscribeUrl } from './trace-stream-url'

/** Reactive surface returned by `useTraceStream`. */
export type TraceStreamHandle = {
  readonly spans: Ref<ReadonlyArray<RemoteSpan>>
  readonly status: Ref<TraceStreamStatus>
  readonly close: () => void
}

/**
 * Subscribe to `/v1/subscribe` and surface live spans in a
 * reactive ref. Auto-reconnects with `Last-Event-ID` so the
 * caller replays missed events. Closes cleanly on unmount.
 * @param options Subscription options.
 * @param options.traceId Optional trace id filter.
 * @returns Reactive spans + status + manual close.
 */
export const useTraceStream = (
  options: { readonly traceId?: string } = {}
): TraceStreamHandle => {
  const spans = ref<ReadonlyArray<RemoteSpan>>([])
  const status = ref<TraceStreamStatus>('connecting')
  const cursor = ref<string | undefined>(undefined)
  const controller = new AbortController()
  const url = subscribeUrl(options.traceId)
  void runLoop(url, spans, status, cursor, controller.signal)
  const close = (): void => controller.abort()
  onUnmounted(close)
  return { spans, status, close }
}
