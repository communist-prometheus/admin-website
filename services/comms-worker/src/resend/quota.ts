import type { QuotaKind } from './response'

const QUOTA_BY_NAME: Readonly<Record<string, QuotaKind>> = {
  daily_quota_exceeded: 'daily',
  monthly_quota_exceeded: 'monthly',
}

/**
 * Map a Resend error `name` to the quota it reports, or undefined when
 * the name is not a quota error (e.g. `rate_limit_exceeded`, or a body
 * we could not read). See https://resend.com/docs/api-reference/errors.
 * @param name The `name` field of a Resend error body.
 * @returns The quota kind, or undefined.
 */
export const quotaKindFromName = (name: unknown): QuotaKind | undefined =>
  typeof name === 'string' ? QUOTA_BY_NAME[name] : undefined

/**
 * Read the quota kind from a Resend error response WITHOUT disturbing a
 * caller that also needs the body: clones the response first, so the
 * original stream stays readable. Returns undefined on any non-quota or
 * unreadable body.
 * @param res A non-ok Resend response (status 429).
 * @returns The quota kind, or undefined.
 */
export const readQuotaKind = async (
  res: Response
): Promise<QuotaKind | undefined> => {
  const body = (await res
    .clone()
    .json()
    .catch(() => undefined)) as { name?: unknown } | undefined
  return quotaKindFromName(body?.name)
}
