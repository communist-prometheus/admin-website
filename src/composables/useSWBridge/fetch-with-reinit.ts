import { reinitSWFromStorage } from './reinit-from-storage'

/** Underlying Service Worker fetch function. */
export type SWFetcher = (
  input: string | URL,
  init?: RequestInit
) => Promise<Response>

/**
 * Retry the request once after re-initialising the worker, returning
 * the original response when no stored token is available.
 * @param fetcher - Underlying SW fetch
 * @param input - Request URL
 * @param init - Request init
 * @param res - The not-ready 503 response
 * @returns Retried response, or the original 503
 */
const retryOnce = async (
  fetcher: SWFetcher,
  input: string | URL,
  init: RequestInit | undefined,
  res: Response
): Promise<Response> =>
  (await reinitSWFromStorage()) ? fetcher(input, init) : res

/**
 * Run a SW fetch; when the worker reports it is not ready (503,
 * emitted only by the recovery paths in fetch-listener/route), re-send
 * the stored token to re-init it and retry the request exactly once.
 * This unblocks saves after the worker is evicted or was never
 * initialised on this origin, instead of dead-ending on "SW not ready".
 * @param fetcher - Underlying SW fetch
 * @param input - Request URL
 * @param init - Request init
 * @returns The response, after at most one reinit + retry
 */
export const fetchWithReinit = async (
  fetcher: SWFetcher,
  input: string | URL,
  init?: RequestInit
): Promise<Response> => {
  const res = await fetcher(input, init)
  return res.status === 503 ? retryOnce(fetcher, input, init, res) : res
}
