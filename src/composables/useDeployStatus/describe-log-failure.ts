import type { JobLogResult } from './job-logs'

const HTTP_REASONS: Readonly<Record<number, string>> = {
  401: 'Token rejected by GitHub (sign in again).',
  403: 'Token is missing the actions:read scope (re-auth).',
  404: 'Log not flushed yet — wait a few seconds and reload.',
}

const httpReason = (
  r: Extract<JobLogResult, { kind: 'http-error' }>
): string => {
  const known = HTTP_REASONS[r.status]
  return known
    ? known
    : `GitHub returned ${r.status}${r.body ? ` — ${r.body}` : ''}`
}

const REASON_BUILDERS: {
  readonly [K in Exclude<JobLogResult, { kind: 'ok' }>['kind']]: (
    r: Extract<JobLogResult, { kind: K }>
  ) => string
} = {
  'no-token': () => 'Sign in to GitHub to load the deploy log.',
  'http-error': r => httpReason(r),
  'network-error': r => `Network error fetching the log: ${r.message}`,
}

/**
 * Render the failure case of a `JobLogResult` as a one-line
 * message suitable for an inline error block. The previous
 * implementation said "token missing or job too young" for every
 * non-OK case — completely opaque when the actual cause is a 403
 * scope problem, a token expiry, or just the log not having been
 * flushed to blob storage yet.
 *
 * @param r A non-`ok` JobLogResult.
 * @returns Human-readable description of the failure reason.
 */
export const describeJobLogFailure = (
  r: Exclude<JobLogResult, { kind: 'ok' }>
): string => {
  const builder = REASON_BUILDERS[r.kind]
  return (builder as (x: typeof r) => string)(r)
}
