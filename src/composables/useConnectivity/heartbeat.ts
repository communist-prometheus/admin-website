/** Minimum interval between heartbeat probes (ms). */
export const HEARTBEAT_INTERVAL_MS = 30_000

const HEARTBEAT_URL = 'https://api.github.com/user'

/**
 * Probe network reachability with a single short-timeout fetch.
 * Resolves true when the request returns 2xx or 4xx (server is
 * up, regardless of auth state); resolves false on network
 * failure or 5xx so callers can flip into offline mode.
 * @param controller AbortController owning the request lifecycle.
 * @returns True when the network appears reachable.
 */
export const probeReachability = async (
  controller: AbortController
): Promise<boolean> => {
  try {
    const response = await fetch(HEARTBEAT_URL, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
      mode: 'cors',
    })
    return response.status < 500
  } catch {
    return false
  }
}
