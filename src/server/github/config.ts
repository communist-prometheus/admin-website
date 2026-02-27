/**
 * GitHub configuration
 */
export interface GitHubConfig {
  readonly owner: string
  readonly repo: string
  readonly token: string
  readonly branch: string
  readonly contentPath: string
}

/**
 * Load GitHub configuration from environment
 */
export const loadGitHubConfig = (): GitHubConfig => ({
  owner: process.env.GITHUB_OWNER || 'communist-prometheus',
  repo: process.env.GITHUB_REPO || 'public-website',
  token: process.env.GITHUB_TOKEN || '',
  branch: process.env.GITHUB_BRANCH || 'main',
  contentPath: process.env.GITHUB_CONTENT_PATH || 'src/content',
})
