import { collectorToken } from './exporter-config'
import type { SseRecord } from './sse-parse'
import { drainReader } from './trace-stream-drain'

/** Outcome of a single connection attempt. */
export type StreamOutcome = 'aborted' | 'ended' | 'error'

const headersFor = (cursor: string | undefined): HeadersInit => {
  const base: Record<string, string> = {
    Authorization: `Bearer ${collectorToken()}`,
    Accept: 'text/event-stream',
  }
  return cursor === undefined ? base : { ...base, 'Last-Event-ID': cursor }
}

/**
 * Open one SSE connection and pump records into `onRecord` until
 * the stream ends or `signal` aborts. Returns an outcome the
 * caller uses to decide whether to reconnect.
 * @param url Subscribe URL.
 * @param cursor Last seen event id, or undefined for first connection.
 * @param onRecord Callback fired for every parsed SSE record.
 * @param signal Abort signal driven by the composable lifecycle.
 * @returns Reason the connection ended.
 */
export const runConnection = async (
  url: string,
  cursor: string | undefined,
  onRecord: (rec: SseRecord) => void,
  signal: AbortSignal
): Promise<StreamOutcome> => {
  try {
    const res = await fetch(url, { headers: headersFor(cursor), signal })
    const reader = res.body?.pipeThrough(new TextDecoderStream()).getReader()
    await (reader === undefined
      ? Promise.resolve()
      : drainReader(reader, onRecord, signal))
    return signal.aborted ? 'aborted' : 'ended'
  } catch {
    return signal.aborted ? 'aborted' : 'error'
  }
}
