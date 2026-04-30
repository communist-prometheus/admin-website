import { chunkSpans, DEFAULT_CHUNK_BYTES } from './chunk-batch'
import { type ChunkOutcome, postChunk } from './send-chunk'
import type { Span } from './span-types'

const sendOne = async (chunk: ReadonlyArray<Span>): Promise<boolean> => {
  const outcome: ChunkOutcome = await postChunk(chunk)
  return outcome.kind === 'ok'
    ? true
    : outcome.kind === 'retry'
      ? sendChunked(chunk, outcome.chunkSize)
      : false
}

/**
 * Ship spans in collector-friendly chunks. Splits any input above
 * `budget` bytes; honours collector 413 by re-splitting with the
 * hint. Returns true only when every chunk lands.
 * @param spans Spans to ship.
 * @param budget Per-chunk byte budget; defaults to DEFAULT_CHUNK_BYTES.
 * @returns True when every chunk was accepted.
 */
export const sendChunked = async (
  spans: ReadonlyArray<Span>,
  budget: number = DEFAULT_CHUNK_BYTES
): Promise<boolean> => {
  const chunks = chunkSpans(spans, budget)
  const results = await Promise.all(chunks.map(chunk => sendOne(chunk)))
  return results.every(ok => ok)
}

/**
 * Ship a batch of spans through the chunked sender. Kept named
 * `sendBatch` so existing callers (`flushNow`, `drainQueuedBatches`)
 * stay unchanged.
 * @param spans Spans to ship.
 * @returns True on success across all chunks.
 */
export const sendBatch = async (
  spans: ReadonlyArray<Span>
): Promise<boolean> => sendChunked(spans)
