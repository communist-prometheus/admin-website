/**
 * Client-side GitHub repository configuration.
 * Values injected at build time via Vite's import.meta.env.
 */
export interface GitHubRepoConfig {
  readonly owner: string
  readonly repo: string
  readonly branch: string
  readonly contentPath: string
  readonly corsProxy: string
}

/**
 * Read GitHub repo config from Vite environment variables.
 * @returns Repository configuration for isomorphic-git
 */
export const getGitHubConfig = (): GitHubRepoConfig => ({
  owner: import.meta.env.VITE_GITHUB_OWNER ?? 'communist-prometheus',
  repo: import.meta.env.VITE_GITHUB_REPO ?? 'public-website',
  branch: import.meta.env.VITE_GITHUB_BRANCH ?? 'develop',
  contentPath: import.meta.env.VITE_GITHUB_CONTENT_PATH ?? 'src/content',
  corsProxy:
    import.meta.env.VITE_CORS_PROXY ?? 'https://cors.isomorphic-git.org',
})
