/** Success response from `POST /api/auth/app-token`. */
export interface AppTokenResponse {
  readonly token: string
  readonly expires_at: string
}

/** Error response from `POST /api/auth/app-token`. */
export interface AppTokenError {
  readonly error: string
  readonly error_description?: string
}

const isTokenResponse = (v: unknown): v is AppTokenResponse =>
  !!v &&
  typeof v === 'object' &&
  typeof (v as { token?: unknown }).token === 'string'

const isTokenError = (v: unknown): v is AppTokenError =>
  !!v &&
  typeof v === 'object' &&
  typeof (v as { error?: unknown }).error === 'string'

/**
 * Exchange an admin password for a GitHub App installation access
 * token via the worker's gated endpoint.
 * @param password - Admin password configured on the worker
 * @returns Parsed success or error response
 */
export const requestAppToken = async (
  password: string
): Promise<AppTokenResponse | AppTokenError> => {
  const res = await fetch('/api/auth/app-token', {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`admin:${password}`)}` },
  })
  const body: unknown = await res.json()
  if (!res.ok) {
    return isTokenError(body)
      ? body
      : { error: 'http_error', error_description: `HTTP ${res.status}` }
  }
  return isTokenResponse(body)
    ? body
    : { error: 'malformed', error_description: 'Malformed token response' }
}
