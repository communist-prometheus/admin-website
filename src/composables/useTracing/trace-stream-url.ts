import { collectorBaseUrl } from './exporter-config'

/**
 * Build the `/v1/subscribe` URL with optional traceId filter.
 * @param traceId Optional trace id filter.
 * @returns Fully-qualified subscribe URL.
 */
export const subscribeUrl = (traceId: string | undefined): string => {
  const base = `${collectorBaseUrl()}/v1/subscribe`
  return traceId === undefined ? base : `${base}?traceId=${traceId}`
}
