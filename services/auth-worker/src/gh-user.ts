const GH_USER_URL = 'https://api.github.com/user'

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const GH_HEADERS = (token: string): HeadersInit => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'User-Agent': 'comprom-auth-worker',
  'X-GitHub-Api-Version': '2022-11-28',
})

/**
 * Resolve the GitHub `login` behind an OAuth token. Returns
 * undefined when GH refuses the token (revoked, expired, wrong
 * scopes) so the caller can map it to 401.
 * @param token GitHub OAuth access token.
 * @returns Login string, or undefined.
 */
export const fetchUserLogin = async (
  token: string
): Promise<string | undefined> => {
  const res = await fetch(GH_USER_URL, { headers: GH_HEADERS(token) })
  if (!res.ok) return undefined
  const body: unknown = await res.json().catch(() => undefined)
  const login = isObject(body) ? body['login'] : undefined
  return typeof login === 'string' ? login : undefined
}

export type OrgRoleCheckInput = {
  readonly org: string
  readonly login: string
  readonly token: string
}

/**
 * Check whether `login` is an org **owner** (GitHub calls this
 * `role: "admin"` on the membership endpoint). GitHub returns
 * 200 + `state: "active"` + `role: "admin"` for owners,
 * `role: "member"` for regular members, `state: "pending"` for
 * unaccepted invitations, and 404 for non-members.
 * @param input Org coordinates + the OAuth token to authenticate.
 * @returns True only when state is `"active"` AND role is `"admin"`.
 */
export const isOrgOwner = async (
  input: OrgRoleCheckInput
): Promise<boolean> => {
  const url = `https://api.github.com/orgs/${input.org}/memberships/${input.login}`
  const res = await fetch(url, { headers: GH_HEADERS(input.token) })
  if (!res.ok) return false
  const body: unknown = await res.json().catch(() => undefined)
  return (
    isObject(body) && body['state'] === 'active' && body['role'] === 'admin'
  )
}
