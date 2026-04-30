import type { SearchFilters } from './search-types'

const dateToMs = (raw: string): string | undefined => {
  const ts = Date.parse(raw)
  return Number.isNaN(ts) ? undefined : String(ts)
}

const set = (
  out: URLSearchParams,
  key: string,
  value: string | undefined
): void => {
  const fire =
    value === undefined || value.length === 0
      ? () => undefined
      : () => {
          out.set(key, value)
        }
  fire()
}

/**
 * Translate the form's `SearchFilters` into the URLSearchParams
 * shape the collector's `GET /v1/traces` understands. Empty
 * fields drop out; date inputs convert to epoch milliseconds.
 * @param filters Active filter set.
 * @param cursor Optional `started_at` cursor for paging.
 * @param limit Page size.
 * @returns URLSearchParams ready to append to the URL.
 */
export const filtersToQuery = (
  filters: SearchFilters,
  cursor: number | undefined = undefined,
  limit = 50
): URLSearchParams => {
  const out = new URLSearchParams()
  set(out, 'q', filters.q)
  set(out, 'from', dateToMs(filters.from))
  set(out, 'to', dateToMs(filters.to))
  set(out, 'service', filters.service)
  set(out, 'org', filters.org)
  set(out, 'repo', filters.repo)
  set(out, 'status', filters.status)
  set(out, 'cursor', cursor === undefined ? undefined : String(cursor))
  out.set('limit', String(limit))
  return out
}
