import type { Octokit } from '@octokit/rest'
import { Effect } from 'effect'
import type { FileContent, GitHubConfig } from '../types'

/**
 * Get file content operation
 * @param octokit - Octokit instance
 * @param config - GitHub configuration
 * @returns Function to get file content
 */
export const getFileContent = (octokit: Octokit, config: GitHubConfig) => {
  return (path: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data } = await octokit.repos.getContent({
          owner: config.owner,
          repo: config.repo,
          path,
        })

        if (Array.isArray(data) || data.type !== 'file') {
          throw new Error('Path is not a file')
        }

        const content = Buffer.from(data.content, 'base64').toString('utf-8')

        return {
          path: data.path,
          content,
          sha: data.sha,
        } as FileContent
      },
      catch: error => new Error(`Failed to get file: ${String(error)}`),
    })
}
