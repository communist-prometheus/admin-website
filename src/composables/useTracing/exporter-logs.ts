import { FLUSH_AT_LOGS, FLUSH_AT_MS } from './exporter-config'
import type { LogRecord } from './log-record'
import { sendLogs } from './send-logs'

let buffer: LogRecord[] = []
let timer: ReturnType<typeof setTimeout> | undefined

const scheduleFlush = (run: () => void): void => {
  globalThis.clearTimeout(timer)
  timer = globalThis.setTimeout(run, FLUSH_AT_MS)
}

/**
 * Push a log record into the exporter buffer. Triggers an
 * immediate flush at `FLUSH_AT_LOGS` entries; otherwise
 * schedules a `FLUSH_AT_MS` time-based flush.
 * @param entry Log record to enqueue.
 * @returns void
 */
export const recordLog = (entry: LogRecord): void => {
  buffer = [...buffer, entry]
  const trigger =
    buffer.length >= FLUSH_AT_LOGS
      ? () => {
          void flushLogs()
        }
      : () =>
          scheduleFlush(() => {
            void flushLogs()
          })
  trigger()
}

/**
 * Flush the log buffer immediately. Drops on send failure —
 * logs are best-effort; spans remain the source of truth.
 * @returns True when a non-empty batch landed.
 */
export const flushLogs = async (): Promise<boolean> => {
  globalThis.clearTimeout(timer)
  timer = undefined
  const pending = buffer.slice()
  buffer = []
  return pending.length === 0 ? false : sendLogs(pending)
}

/** Reset the log buffer and any pending timer. Used by tests. */
export const resetLogExporter = (): void => {
  globalThis.clearTimeout(timer)
  timer = undefined
  buffer = []
}

/**
 * Current log buffer length — for tests and dev overlays.
 * @returns Number of logs waiting to be flushed.
 */
export const bufferedLogCount = (): number => buffer.length
