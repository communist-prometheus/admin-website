import { FLUSH_AT_MS, FLUSH_AT_SPANS } from './exporter-config'
import { sendBatch } from './exporter-send'
import type { FlushOutcome } from './exporter-types'
import { enqueueBatch } from './queue-idb-write'
import type { Span } from './span-types'

let buffer: Span[] = []
let timer: ReturnType<typeof setTimeout> | undefined

const scheduleFlush = (run: () => void): void => {
  globalThis.clearTimeout(timer)
  timer = globalThis.setTimeout(run, FLUSH_AT_MS)
}

/**
 * Push a finished span into the exporter buffer. Triggers a
 * flush when the buffer reaches `FLUSH_AT_SPANS` spans;
 * otherwise schedules a `FLUSH_AT_MS` time-based flush.
 * @param span Finished span to enqueue.
 * @returns void
 */
export const recordSpan = (span: Span): void => {
  buffer = [...buffer, span]
  const trigger =
    buffer.length >= FLUSH_AT_SPANS
      ? () => {
          void flushNow()
        }
      : () =>
          scheduleFlush(() => {
            void flushNow()
          })
  trigger()
}

/**
 * Flush the buffer immediately. Successful sends drain the
 * buffer; failed sends persist the batch to IDB so the
 * connectivity-online drain (#7.2) picks it up later.
 * @returns Outcome describing what was sent.
 */
export const flushNow = async (): Promise<FlushOutcome> => {
  globalThis.clearTimeout(timer)
  timer = undefined
  const pending = buffer.slice()
  const empty = pending.length === 0
  const ok = empty ? false : await sendBatch(pending)
  const sent = !empty && ok
  buffer = sent ? [] : []
  await (!empty && !ok ? enqueueBatch(pending) : Promise.resolve())
  return empty
    ? { kind: 'idle' }
    : sent
      ? { kind: 'sent', count: pending.length }
      : { kind: 'fail', count: pending.length }
}

/** Reset the buffer and any pending timer. Used by tests. */
export const resetExporter = (): void => {
  globalThis.clearTimeout(timer)
  timer = undefined
  buffer = []
}

/**
 * Current buffer length — for tests and dev overlays.
 * @returns Number of spans waiting to be flushed.
 */
export const bufferedSpanCount = (): number => buffer.length
