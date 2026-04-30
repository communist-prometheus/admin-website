import {
  collectorBaseUrl,
  collectorToken,
} from '@/composables/useTracing/exporter-config'
import { filtersToQuery } from './filters-to-query'
import type { SearchFilters, SearchResponse } from './search-types'

const isResponse = (v: unknown): v is SearchResponse =>
  v !== null &&
  typeof v === 'object' &&
  Array.isArray((v as { traces?: unknown }).traces)

const empty: SearchResponse = { traces: [], nextCursor: undefined }

/**
 * Call `GET /v1/traces` with the form filters + optional cursor.
 * Network or non-2xx errors collapse to the empty response so
 * callers don't crash; an `error` flag is returned alongside.
 * @param filters Form filter set.
 * @param cursor Optional `started_at` cursor for the next page.
 * @returns Search response + error flag.
 */
export const fetchSearch = async (
  filters: SearchFilters,
  cursor?: number
): Promise<{ response: SearchResponse; error: boolean }> => {
  try {
    const url = `${collectorBaseUrl()}/v1/traces?${filtersToQuery(filters, cursor)}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${collectorToken()}` },
    })
    const ok = res.ok
    const body: unknown = ok ? await res.json() : undefined
    return ok && isResponse(body)
      ? { response: body, error: false }
      : { response: empty, error: true }
  } catch {
    return { response: empty, error: true }
  }
}
