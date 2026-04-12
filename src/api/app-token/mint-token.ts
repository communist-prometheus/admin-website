/** Shape of `POST /app/installations/{id}/access_tokens` response. */
export interface InstallationTokenResponse {
  readonly token: string
  readonly expires_at: string
  readonly permissions: Record<string, string>
  readonly repository_selection: string
}

const TOKEN_URL = (installationId: string): string =>
  `https://api.github.com/app/installations/${installationId}/access_tokens`

/**
 * Mint a GitHub App installation access token using the provided JWT.
 * @param jwt - Signed GitHub App JWT with the app ID as `iss`
 * @param installationId - Numeric installation ID
 * @returns Token + expiry metadata
 */
export const mintInstallationToken = async (
  jwt: string,
  installationId: string
): Promise<InstallationTokenResponse> => {
  const res = await fetch(TOKEN_URL(installationId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'comprom-admin-app',
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `installation token request failed: ${res.status} ${text}`
    )
  }
  return res.json() as Promise<InstallationTokenResponse>
}
