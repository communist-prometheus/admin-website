const GH_USER_URL = 'https://api.github.com/user'
const GH_TOKEN_URL = 'https://github.com/login/oauth/access_token'

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

/**
 * Exchange a GitHub OAuth `code` for an access token. The
 * client_id is taken from the worker env so each environment can
 * point at its own GitHub App. Throws when GH refuses the swap
 * so the handler returns 4xx.
 * @param code OAuth code from the redirect.
 * @param clientId GitHub App client id.
 * @param clientSecret GitHub App client secret.
 * @returns Access token GH issues for the code.
 */
export const exchangeCodeForToken = async (
  code: string,
  clientId: string,
  clientSecret: string
): Promise<string> => {
  const res = await fetch(GH_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  })
  const body: unknown = await res.json()
  const token = isObject(body) ? body['access_token'] : undefined
  return typeof token === 'string'
    ? token
    : Promise.reject(new Error('GitHub OAuth exchange failed'))
}

/**
 * Resolve the GitHub `login` of the user behind an access token.
 * Used by `/auth/exchange` to populate the JWT subject claim.
 * @param token Access token from `exchangeCodeForToken`.
 * @returns GitHub login string.
 */
export const fetchUserLogin = async (token: string): Promise<string> => {
  const res = await fetch(GH_USER_URL, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'log-collector',
    },
  })
  const body: unknown = await res.json()
  const login = isObject(body) ? body['login'] : undefined
  return typeof login === 'string'
    ? login
    : Promise.reject(new Error('Could not read GitHub user login'))
}
