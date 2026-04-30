/** Default flush trigger: 100 spans. */
export const FLUSH_AT_SPANS = 100

/** Default flush trigger: 30 seconds since the first add. */
export const FLUSH_AT_MS = 30_000

/**
 * Resolve the collector base URL. Reads `VITE_COLLECTOR_URL`
 * when present, falling back to the published worker host so a
 * default build still posts to a real endpoint.
 * @returns Origin string with no trailing slash.
 */
export const collectorBaseUrl = (): string =>
  (import.meta.env['VITE_COLLECTOR_URL'] as string | undefined) ??
  'https://log-collector.workers.dev'

/**
 * Read the active collector JWT. Source order: localStorage
 * (set by the auth flow). Returns `''` when missing — the
 * collector's auth middleware will reject anonymous calls.
 * @returns JWT string or empty.
 */
export const collectorToken = (): string =>
  globalThis.localStorage?.getItem('collector_jwt') ?? ''
