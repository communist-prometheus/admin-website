const GH = 'https://api.github.com'

/**
 * Authenticated GitHub GET from a CF Worker. Sets a User-Agent (GitHub
 * 403s requests without one; Workers send none) and `no-store` — these
 * are per-caller authenticated reads behind shared URLs, so the CF
 * fetch cache would serve stale data and leak one caller's result to
 * another.
 * @param token - Caller's GitHub OAuth token.
 * @param path - API path beginning with '/'.
 * @returns The fetch Response.
 */
export const ghGet = (token: string, path: string): Promise<Response> =>
  fetch(`${GH}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'prometheus-admin',
    },
    cache: 'no-store',
  })
