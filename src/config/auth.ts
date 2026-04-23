/**
 * Auth configuration for PKCE OAuth flow.
 */
export interface AuthConfig {
  readonly clientId: string
  readonly redirectUri: string
  readonly scopes: string
}

/**
 * Get auth config from environment variables.
 *
 * The redirect URI is taken from `VITE_OAUTH_REDIRECT_URI` when set so the
 * admin can be served from multiple hostnames (custom domain, workers.dev,
 * localhost) while always sending GitHub a single callback URL that matches
 * what's registered in the GitHub App. The popup callback then cross-posts
 * the token back to the original opener via the allowlist in
 * useOAuthPopup/handlers.ts.
 *
 * Falls back to `${location.origin}/auth/github/callback` only when the env
 * var is absent — useful for local dev setups where you've registered a
 * localhost callback directly.
 * @returns Auth configuration for GitHub PKCE flow
 */
export const getAuthConfig = (): AuthConfig => ({
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID ?? '',
  redirectUri:
    import.meta.env.VITE_OAUTH_REDIRECT_URI ??
    `${location.origin}/auth/github/callback`,
  scopes: 'repo read:user read:org admin:org',
})
