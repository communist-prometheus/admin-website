import type { Octokit } from '@octokit/rest'
import { Effect } from 'effect'
import type { GitHubConfig } from '../types'

/**
 * Delete file operation
 * @param octokit - Octokit instance
 * @param config - GitHub configuration
 * @returns Function to delete file
 */
export const deleteFile = (octokit: Octokit, config: GitHubConfig) => {
  return (path: string, sha: string, message: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data } = await octokit.repos.deleteFile({
          owner: config.owner,
          repo: config.repo,
          path,
          message,
          sha,
          branch: config.branch,
        })

        return data
      },
      catch: error => new Error(`Failed to delete file: ${String(error)}`),
    })
}
