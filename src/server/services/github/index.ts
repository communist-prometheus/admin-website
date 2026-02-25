import { Effect } from 'effect'
import { GitHubService } from './service'

/**
 * Create GitHub service instance
 * @param token - GitHub access token
 * @returns Effect with GitHub service
 */
export const createGitHubService = (token: string) =>
  Effect.sync(
    () =>
      new GitHubService({
        owner: process.env['GITHUB_REPO_OWNER'] || 'prometheus',
        repo: process.env['GITHUB_REPO_NAME'] || 'public-website',
        token,
      })
  )

export { GitHubService } from './service'
export type { FileContent, GitHubConfig, TreeItem } from './types'
