/**
 * Server configuration object containing environment-based settings.
 * Includes production mode, OAuth settings, GitHub credentials, and server options.
 */
/**
 * Server configuration object containing environment-based settings.
 * Includes production mode, OAuth settings, GitHub credentials, and server options.
 */
export const config = {
  isProduction: process.env['NODE_ENV'] === 'production',
  isMockOAuth: process.env['MOCK_OAUTH'] === 'true',
  github: {
    clientId: process.env['GITHUB_CLIENT_ID'] ?? '',
    clientSecret: process.env['GITHUB_CLIENT_SECRET'] ?? '',
    callbackUrl: process.env['GITHUB_CALLBACK_URL'] ?? '',
  },
  server: {
    port: 3000,
    host: 'localhost',
  },
}
