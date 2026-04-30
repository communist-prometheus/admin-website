import { parseChunk, type SseRecord } from './sse-parse'

/**
 * Drain a TextDecoder-backed reader, dispatching every fully
 * formed SSE record to `onRecord`. Stops when the underlying
 * stream ends or the abort signal fires.
 * @param reader TextDecoder reader over the response body.
 * @param onRecord Callback fired for each parsed record.
 * @param signal Abort signal driven by the caller's lifecycle.
 * @returns Promise that resolves when the loop exits.
 */
export const drainReader = async (
  reader: ReadableStreamDefaultReader<string>,
  onRecord: (rec: SseRecord) => void,
  signal: AbortSignal
): Promise<void> => {
  let leftover = ''
  let done = false
  while (!done && !signal.aborted) {
    const result = await reader.read()
    done = result.done
    const next = parseChunk(leftover, result.value ?? '')
    leftover = next.leftover
    next.records.forEach(onRecord)
  }
}
