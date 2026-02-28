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
export const loadGitHubConfig = (): GitHubConfig => {
  const isTest = process.env.NODE_ENV === 'test'
  const token = isTest
    ? process.env.GITHUB_E2E_KEY || process.env.GITHUB_TOKEN || ''
    : process.env.GITHUB_TOKEN || ''

  return {
    owner: process.env.GITHUB_OWNER || 'communist-prometheus',
    repo: process.env.GITHUB_REPO || 'public-website',
    token,
    branch: process.env.GITHUB_BRANCH || 'main',
    contentPath: process.env.GITHUB_CONTENT_PATH || 'src/content',
  }
}
