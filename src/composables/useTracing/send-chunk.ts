import { collectorBaseUrl, collectorToken } from './exporter-config'
import type { Span } from './span-types'

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

/** Outcome of a single chunk POST. */
export type ChunkOutcome =
  | { readonly kind: 'ok' }
  | { readonly kind: 'fail' }
  | { readonly kind: 'retry'; readonly chunkSize: number }

const parseRetry = async (res: Response): Promise<ChunkOutcome> => {
  const body: unknown = await res.json().catch(() => undefined)
  const hint = isObject(body) ? body['chunkSize'] : undefined
  return typeof hint === 'number'
    ? { kind: 'retry', chunkSize: hint }
    : { kind: 'fail' }
}

/**
 * POST a single chunk to `/v1/traces`. 413 responses surface as a
 * `retry` outcome carrying the collector's chunkSize hint so the
 * caller can re-split. Network and 5xx come back as `fail`; the
 * caller persists the chunk and retries on reconnect.
 * @param spans Spans to ship in this chunk.
 * @returns Discriminated chunk outcome.
 */
export const postChunk = async (
  spans: ReadonlyArray<Span>
): Promise<ChunkOutcome> => {
  try {
    const res = await fetch(`${collectorBaseUrl()}/v1/traces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${collectorToken()}`,
      },
      body: JSON.stringify({ spans }),
    })
    return res.status === 413
      ? await parseRetry(res)
      : res.ok
        ? { kind: 'ok' }
        : { kind: 'fail' }
  } catch {
    return { kind: 'fail' }
  }
}
