import type { MiddlewareHandler } from 'hono'

/** Default max batch size: 256 KB. */
export const MAX_BATCH_SIZE_BYTES = 256 * 1024

const sizeOf = (header: string | undefined): number =>
  header === undefined ? 0 : Number.parseInt(header, 10) || 0

/**
 * Hono middleware that rejects ingest payloads whose
 * `Content-Length` exceeds `MAX_BATCH_SIZE_BYTES`. Reply is 413
 * with a `chunkSize` hint so the exporter (Epic 7) can split.
 * Applied only to mutation routes — health and exchange are
 * tiny and always under the cap.
 * @param max Optional override for the limit (defaults to 256 KB).
 * @returns Hono middleware handler.
 */
export const batchSizeGuard = (
  max: number = MAX_BATCH_SIZE_BYTES
): MiddlewareHandler => {
  return async (c, next) => {
    const size = sizeOf(c.req.header('content-length'))
    return size > max
      ? c.json(
          { error: 'batch too large', limit: max, chunkSize: max / 2 },
          413
        )
      : await next()
  }
}
