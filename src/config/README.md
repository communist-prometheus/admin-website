# config

Application configuration read from Vite environment variables at build time.

## Key Exports

- `getAuthConfig` -- PKCE OAuth configuration (client ID, redirect URI, scopes)
- `getGitHubConfig` -- GitHub repository configuration (owner, repo, branch, CORS proxy)
- `typePath` / `nestedFile` / `flatFile` / `contentFile` / `assetDir` / `assetFile` -- content path builders that dispatch between nested and flat file layouts
- `isTypePath` -- check if a file path belongs to a given content type
