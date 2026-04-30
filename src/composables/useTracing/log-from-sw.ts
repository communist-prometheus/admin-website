import type { LogEntry } from '@/sw/protocol'
import type { LogRecord } from './log-record'

const stringify = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value)

const dataAttributes = (
  data: Record<string, unknown> | undefined
): Record<string, string> =>
  data === undefined
    ? {}
    : Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, stringify(v)])
      )

/**
 * Convert a Service Worker log entry into a collector log record.
 * Preserves SW trace+span ids stamped by the dispatcher so the
 * viewer can stitch logs into the originating client trace.
 * @param entry Log entry broadcast by the SW.
 * @returns Collector-shaped log record.
 */
export const logFromSWEntry = (entry: LogEntry): LogRecord => ({
  traceId: entry.traceId,
  spanId: entry.spanId,
  level: entry.level,
  message: entry.msg,
  at: entry.ts,
  attributes: { cat: entry.cat, ...dataAttributes(entry.data) },
})
