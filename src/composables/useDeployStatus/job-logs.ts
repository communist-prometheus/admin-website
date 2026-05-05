import { loadToken } from '@/composables/useAuth/token-storage'

const REPO = 'communist-prometheus/public-website'

const corsBase = (): string =>
  globalThis.location?.origin
    ? `${globalThis.location.origin}/api/cors`
    : '/api/cors'

const fetchLogText = async (
  url: string,
  token: string
): Promise<string | undefined> => {
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/plain' },
    cache: 'no-store',
  })
  return r.ok ? r.text() : undefined
}

/**
 * Fetch the raw plain-text log file for a workflow job. GitHub
 * answers `/repos/.../jobs/:id/logs` with a 302 to a short-lived
 * signed URL on its blob storage; the CORS proxy follows the
 * redirect so the browser sees a single response with the
 * `Access-Control-Allow-Origin` header injected.
 *
 * Returns undefined when the user has no token, the job is too
 * young (logs not flushed yet), or the API rejects the request.
 *
 * @param jobId GitHub Actions job id (numeric).
 * @returns Plain-text log or undefined on failure.
 */
export const fetchJobLog = async (
  jobId: number
): Promise<string | undefined> => {
  const token = loadToken()
  const path = `/api/cors/api.github.com/repos/${REPO}/actions/jobs/${jobId}/logs`
  const url = `${corsBase().replace(/\/api\/cors$/, '')}${path}`
  return token ? fetchLogText(url, token) : undefined
}
