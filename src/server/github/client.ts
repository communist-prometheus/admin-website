import { Octokit } from '@octokit/rest'
import { Effect } from 'effect'
import type { ContentType } from '@/types/github-content'
import type { GitHubConfig } from './config'

/**
 * Create GitHub client
 */
export const createGitHubClient = (config: GitHubConfig) => {
  const octokit = new Octokit({ auth: config.token })

  return {
    /**
     * List files in a content directory
     */
    listContent: (type: ContentType) =>
      Effect.tryPromise({
        try: async () => {
          const path = `${config.contentPath}/${type}`
          const response = await octokit.rest.repos.getContent({
            owner: config.owner,
            repo: config.repo,
            path,
            ref: config.branch,
          })

          if (Array.isArray(response.data)) {
            return response.data
              .filter(
                item => item.type === 'file' && item.name.endsWith('.md')
              )
              .map(item => ({
                name: item.name,
                path: item.path,
                sha: item.sha,
                size: item.size,
                url: item.url,
                html_url: item.html_url,
                git_url: item.git_url,
                download_url: item.download_url,
                type: 'file' as const,
                content: 'content' in item ? item.content : undefined,
                encoding: 'encoding' in item ? item.encoding : undefined,
              }))
          }
          return []
        },
        catch: error => new Error(`Failed to list content: ${error}`),
      }),

    /**
     * Get file content
     */
    getFile: (path: string) =>
      Effect.tryPromise({
        try: async () => {
          const response = await octokit.rest.repos.getContent({
            owner: config.owner,
            repo: config.repo,
            path,
            ref: config.branch,
          })

          if ('content' in response.data && response.data.type === 'file') {
            const content = Buffer.from(
              response.data.content,
              'base64'
            ).toString('utf-8')
            return {
              content,
              sha: response.data.sha,
              path: response.data.path,
            }
          }
          throw new Error('Not a file')
        },
        catch: error => new Error(`Failed to get file: ${error}`),
      }),

    /**
     * Create or update file
     */
    updateFile: (
      path: string,
      content: string,
      message: string,
      sha?: string
    ) =>
      Effect.tryPromise({
        try: async () => {
          const response =
            await octokit.rest.repos.createOrUpdateFileContents({
              owner: config.owner,
              repo: config.repo,
              path,
              message,
              content: Buffer.from(content).toString('base64'),
              branch: config.branch,
              sha,
            })
          return response.data
        },
        catch: error => new Error(`Failed to update file: ${error}`),
      }),

    /**
     * Delete file
     */
    deleteFile: (path: string, message: string, sha: string) =>
      Effect.tryPromise({
        try: async () => {
          const response = await octokit.rest.repos.deleteFile({
            owner: config.owner,
            repo: config.repo,
            path,
            message,
            sha,
            branch: config.branch,
          })
          return response.data
        },
        catch: error => new Error(`Failed to delete file: ${error}`),
      }),
  }
}

export type GitHubClient = ReturnType<typeof createGitHubClient>
