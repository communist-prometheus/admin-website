import type { TokenResponse } from './session'

const tokenProxyUrl = (): string =>
  import.meta.env.VITE_TOKEN_PROXY ?? '/api/oauth/token'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const pick = (
  record: Record<string, unknown>,
  key: string
): string | undefined => {
  const value = record[key]
  return typeof value === 'string' ? value : undefined
}

/*
 * Narrow untrusted JSON to the known token fields (all string scalars —
 * the proxy stringifies GitHub's numeric expires_in), rather than asserting
 * a shape over the network response.
 */
const toTokenResponse = (value: unknown): TokenResponse => {
  const record = isRecord(value) ? value : {}
  return {
    access_token: pick(record, 'access_token'),
    refresh_token: pick(record, 'refresh_token'),
    expires_in: pick(record, 'expires_in'),
    refresh_token_expires_in: pick(record, 'refresh_token_expires_in'),
    error: pick(record, 'error'),
  }
}

/**
 * POST a token request (code exchange or refresh grant) to the same-origin
 * proxy that injects the client secret. Never throws on a non-2xx body: a
 * GitHub error payload is returned verbatim so the caller can inspect
 * `error`; a non-JSON body degrades to an empty response.
 * @param body - URL-encoded grant parameters
 * @returns The parsed token response
 */
export const postToken = async (
  body: URLSearchParams
): Promise<TokenResponse> => {
  const res = await fetch(tokenProxyUrl(), { method: 'POST', body })
  const parsed: unknown = await res.json().catch(() => ({}))
  return toTokenResponse(parsed)
}
