/** Parsed query parameters for `GET /v1/traces`. */
export type SearchQuery = {
  readonly q: string | undefined
  readonly from: number | undefined
  readonly to: number | undefined
  readonly service: string | undefined
  readonly org: string | undefined
  readonly repo: string | undefined
  readonly status: 'ok' | 'error' | 'unset' | undefined
  readonly cursor: number | undefined
  readonly limit: number
}

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200
type SpanStatus = 'ok' | 'error' | 'unset'

const isStatus = (v: string | undefined): v is SpanStatus =>
  v === 'ok' || v === 'error' || v === 'unset'

const intOr = (raw: string | undefined): number | undefined => {
  const n = raw === undefined ? Number.NaN : Number.parseInt(raw, 10)
  return Number.isNaN(n) ? undefined : n
}

const clampLimit = (raw: string | undefined): number => {
  const n = intOr(raw) ?? DEFAULT_LIMIT
  return Math.max(1, Math.min(MAX_LIMIT, n))
}

const statusOr = (raw: string | undefined): SpanStatus | undefined =>
  isStatus(raw) ? raw : undefined

/**
 * Parse + normalise the URL query for the trace search endpoint.
 * Bad / missing inputs collapse to undefined so the SQL builder
 * can omit the corresponding WHERE clause.
 * @param search Raw URLSearchParams.
 * @returns Validated query parameters.
 */
export const parseSearchQuery = (search: URLSearchParams): SearchQuery => ({
  q: search.get('q') ?? undefined,
  from: intOr(search.get('from') ?? undefined),
  to: intOr(search.get('to') ?? undefined),
  service: search.get('service') ?? undefined,
  org: search.get('org') ?? undefined,
  repo: search.get('repo') ?? undefined,
  status: statusOr(search.get('status') ?? undefined),
  cursor: intOr(search.get('cursor') ?? undefined),
  limit: clampLimit(search.get('limit') ?? undefined),
})
