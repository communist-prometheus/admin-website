import { Effect } from 'effect'
import { MockGitHubService } from './mock-service'
import { GitHubService } from './service'

/**
 * Create GitHub service instance
 * @param token - GitHub access token
 * @returns Effect with GitHub service
 */
export const createGitHubService = (token: string) =>
  Effect.sync(() =>
    process.env.MOCK_OAUTH === 'true'
      ? new MockGitHubService()
      : new GitHubService({
          owner: process.env.GITHUB_OWNER || 'communist-prometheus',
          repo: process.env.GITHUB_REPO || 'public-website',
          token,
          branch: process.env.GITHUB_BRANCH || 'main',
        })
  )

export { GitHubService } from './service'
export type { FileContent, GitHubConfig, TreeItem } from './types'
