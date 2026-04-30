import { collectorBaseUrl, collectorToken } from './exporter-config'
import type { Span } from './span-types'

/**
 * POST a batch of spans to the collector. Returns true on 2xx,
 * false on any other outcome. Errors are swallowed so the
 * exporter loop never throws — failed batches are retained by
 * the caller for the next flush attempt.
 * @param spans Frozen list of spans to ship.
 * @returns True when the collector accepted the batch.
 */
export const sendBatch = async (
  spans: ReadonlyArray<Span>
): Promise<boolean> => {
  try {
    const res = await fetch(`${collectorBaseUrl()}/v1/traces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${collectorToken()}`,
      },
      body: JSON.stringify({ spans }),
    })
    return res.ok
  } catch {
    return false
  }
}
