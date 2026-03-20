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
 * @returns Auth configuration for GitHub PKCE flow
 */
export const getAuthConfig = (): AuthConfig => ({
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID ?? '',
  redirectUri: `${location.origin}/auth/github/callback`,
  scopes: 'repo read:user',
})
