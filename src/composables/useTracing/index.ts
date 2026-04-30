/** W3C trace-context + span recording + OTLP exporter helpers. */
export {
  bufferedSpanCount,
  flushNow,
  recordSpan,
  resetExporter,
} from './exporter'
export type { Span, SpanStatus } from './span-types'
export {
  clearSpans,
  currentSpan,
  finishSpan,
  listAllSpans,
  MAX_SPANS,
  onFinishSpan,
  startSpan,
} from './spans-store'
export {
  childOf,
  newRootTraceparent,
  parse as parseTraceparent,
  serialise as serialiseTraceparent,
} from './traceparent'
export type { Traceparent } from './traceparent-types'
