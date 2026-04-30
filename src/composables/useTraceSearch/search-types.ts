/** Filter set the search form maintains. */
export type SearchFilters = {
  readonly q: string
  readonly from: string
  readonly to: string
  readonly service: string
  readonly org: string
  readonly repo: string
  readonly status: 'ok' | 'error' | 'unset' | ''
}

/** Empty filter set — used to seed the form. */
export const emptyFilters: SearchFilters = {
  q: '',
  from: '',
  to: '',
  service: '',
  org: '',
  repo: '',
  status: '',
}

/** One trace row in the search results. */
export type TraceSummary = {
  readonly traceId: string
  readonly rootSpanId: string
  readonly rootName: string
  readonly status: string
  readonly startedAt: number
  readonly spanCount: number
  readonly durationMs: number
}

/** Response body returned by `GET /v1/traces`. */
export type SearchResponse = {
  readonly traces: ReadonlyArray<TraceSummary>
  readonly nextCursor: number | undefined
}
