import type { Ref } from 'vue'
import type { RemoteSpan, TraceStreamStatus } from './remote-span'
import { runConnection, type StreamOutcome } from './trace-stream-fetch'
import { handleRecord, sleepFor } from './trace-stream-helpers'

/** Delay between reconnect attempts (ms). */
export const RECONNECT_DELAY_MS = 1_000

/**
 * Drive the SSE subscription loop: open a connection, drain it,
 * then reconnect with the latest cursor until the abort signal
 * fires. Updates the reactive `status` and `spans` refs in place.
 * @param url Subscribe URL.
 * @param spans Reactive store of received spans.
 * @param status Reactive connection status.
 * @param cursor Reactive last-seen event id.
 * @param signal Abort signal driven by composable lifecycle.
 * @returns Promise that resolves once `signal` aborts.
 */
export const runLoop = async (
  url: string,
  spans: Ref<ReadonlyArray<RemoteSpan>>,
  status: Ref<TraceStreamStatus>,
  cursor: Ref<string | undefined>,
  signal: AbortSignal
): Promise<void> => {
  while (!signal.aborted) {
    status.value = 'connecting'
    const outcome: StreamOutcome = await runConnection(
      url,
      cursor.value,
      r => handleRecord(r, spans, cursor),
      signal
    )
    status.value = outcome === 'aborted' ? 'closed' : 'reconnecting'
    await (signal.aborted
      ? Promise.resolve()
      : sleepFor(RECONNECT_DELAY_MS, signal))
  }
  status.value = 'closed'
}
