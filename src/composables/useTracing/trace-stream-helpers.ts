import type { Ref } from 'vue'
import type { RemoteSpan } from './remote-span'
import type { SseRecord } from './sse-parse'
import { recordToSpan } from './trace-stream-record'

/** Maximum spans retained on the reactive store (FIFO eviction). */
export const MAX_SPANS = 500

const appendCapped = (
  spans: ReadonlyArray<RemoteSpan>,
  next: RemoteSpan
): ReadonlyArray<RemoteSpan> =>
  spans.length >= MAX_SPANS ? [...spans.slice(1), next] : [...spans, next]

/**
 * Append a parsed SSE record to the reactive span store and
 * advance the cursor to the record's id (when present). No-op
 * when the record isn't a span payload.
 * @param record SSE record from the parser.
 * @param spans Reactive store to append into.
 * @param cursor Reactive last-seen event id.
 * @returns void
 */
export const handleRecord = (
  record: SseRecord,
  spans: Ref<ReadonlyArray<RemoteSpan>>,
  cursor: Ref<string | undefined>
): void => {
  const span = recordToSpan(record)
  const apply =
    span === undefined
      ? () => undefined
      : () => {
          spans.value = appendCapped(spans.value, span)
        }
  apply()
  cursor.value = record.id ?? cursor.value
}

/**
 * Resolve after `ms` milliseconds, or immediately when the
 * abort signal fires.
 * @param ms Delay budget in milliseconds.
 * @param signal Abort signal driven by the caller's lifecycle.
 * @returns Promise that resolves on timeout or abort.
 */
export const sleepFor = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise(resolve => {
    const t = globalThis.setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      globalThis.clearTimeout(t)
      resolve()
    })
  })
