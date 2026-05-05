import { loadToken } from '@/composables/useAuth/token-storage'

const REPO = 'communist-prometheus/public-website'

const corsBase = (): string =>
  globalThis.location?.origin
    ? `${globalThis.location.origin}/api/cors`
    : '/api/cors'

/**
 * Result of a job-log fetch attempt. Either the plain-text log on
 * success or a precise reason on failure — the editor needs the
 * real cause (token expired, log not flushed yet, GH 404), not a
 * generic "log unavailable".
 */
export type JobLogResult =
  | { readonly kind: 'ok'; readonly text: string }
  | { readonly kind: 'no-token' }
  | {
      readonly kind: 'http-error'
      readonly status: number
      readonly body: string
    }
  | { readonly kind: 'network-error'; readonly message: string }

const truncate = (s: string, max: number): string =>
  s.length > max ? `${s.slice(0, max)}…` : s

const onHttp = async (r: Response): Promise<JobLogResult> => {
  const body = await r.text().catch(() => '')
  return r.ok
    ? { kind: 'ok', text: body }
    : { kind: 'http-error', status: r.status, body: truncate(body, 500) }
}

const fetchLogText = async (
  url: string,
  token: string
): Promise<JobLogResult> => {
  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'text/plain' },
      cache: 'no-store',
    })
    return onHttp(r)
  } catch (e) {
    return {
      kind: 'network-error',
      message: e instanceof Error ? e.message : String(e),
    }
  }
}

/**
 * Fetch the raw plain-text log file for a workflow job. GitHub
 * answers `/repos/.../jobs/:id/logs` with a 302 to a short-lived
 * signed URL on its blob storage; the CORS proxy follows the
 * redirect so the browser sees a single response with the
 * `Access-Control-Allow-Origin` header injected.
 *
 * Returns a tagged JobLogResult so the caller can surface a
 * precise reason (no token, 404, 403, network error) instead of
 * the previous "token missing or job too young" lie.
 *
 * @param jobId GitHub Actions job id (numeric).
 * @returns Tagged result with the log text or the failure reason.
 */
export const fetchJobLog = async (jobId: number): Promise<JobLogResult> => {
  const token = loadToken()
  const path = `/api/cors/api.github.com/repos/${REPO}/actions/jobs/${jobId}/logs`
  const url = `${corsBase().replace(/\/api\/cors$/, '')}${path}`
  return token ? fetchLogText(url, token) : { kind: 'no-token' }
}
