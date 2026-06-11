const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

/**
 * Check that a login is an ACTIVE member of the org. Gate for
 * `/auth/exchange` — without it any GitHub user who completes the
 * OAuth flow would receive a valid collector JWT and could write
 * arbitrary spans/logs into the observability store.
 * @param org GitHub org login.
 * @param login User login to check.
 * @param token The user's own access token (may read own membership).
 * @returns true when the user's membership state is `active`.
 */
export const isOrgMember = async (
  org: string,
  login: string,
  token: string
): Promise<boolean> => {
  const url = `https://api.github.com/orgs/${org}/memberships/${login}`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'log-collector',
    },
  })
  if (!res.ok) return false
  const body: unknown = await res.json().catch(() => undefined)
  return isObject(body) && body['state'] === 'active'
}
