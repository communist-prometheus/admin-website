import {
  collectorBaseUrl,
  collectorToken,
} from '@/composables/useTracing/exporter-config'
import {
  type DetailError,
  errorFor,
  isDetailBody,
  type TraceDetailBody,
} from './detail-types'

/** Outcome of a single detail fetch. */
export type DetailOutcome = {
  readonly body: TraceDetailBody | undefined
  readonly error: DetailError
}

/**
 * Call `GET /v1/traces/:traceId`. Maps HTTP status to a panel
 * error union and returns the parsed body when allowed.
 * @param traceId Trace to fetch.
 * @returns Detail outcome.
 */
export const fetchDetail = async (
  traceId: string
): Promise<DetailOutcome> => {
  try {
    const res = await fetch(`${collectorBaseUrl()}/v1/traces/${traceId}`, {
      headers: { Authorization: `Bearer ${collectorToken()}` },
    })
    const raw: unknown = res.ok ? await res.json() : undefined
    return res.ok && isDetailBody(raw)
      ? { body: raw, error: undefined }
      : { body: undefined, error: res.ok ? 'unknown' : errorFor(res.status) }
  } catch {
    return { body: undefined, error: 'unknown' }
  }
}
