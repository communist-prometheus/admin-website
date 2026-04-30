import { collectorBaseUrl, collectorToken } from './exporter-config'
import type { LogRecord } from './log-record'

/**
 * POST a log batch to `/v1/logs`. Network errors and non-2xx
 * responses come back as `false`; the caller decides whether to
 * drop or retain. The collector enforces its own size cap and
 * will return 413 if exceeded — we surface that as `false` here
 * since logs are smaller than spans and chunking is a follow-up.
 * @param logs Logs to ship in this batch.
 * @returns True when the collector accepted the batch.
 */
export const sendLogs = async (
  logs: ReadonlyArray<LogRecord>
): Promise<boolean> => {
  try {
    const res = await fetch(`${collectorBaseUrl()}/v1/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${collectorToken()}`,
      },
      body: JSON.stringify({ logs }),
    })
    return res.ok
  } catch {
    return false
  }
}
