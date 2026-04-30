import type { Span } from './span-types'

/** Wire format for the `/v1/traces` batch payload. */
export type SpanBatch = {
  readonly spans: ReadonlyArray<Span>
}

/** Result of a single flush attempt. */
export type FlushOutcome =
  | { readonly kind: 'sent'; readonly count: number }
  | { readonly kind: 'fail'; readonly count: number }
  | { readonly kind: 'idle' }
