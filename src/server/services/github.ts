import { Octokit } from '@octokit/rest'
import { Effect } from 'effect'

interface GitHubConfig {
  owner: string
  repo: string
  token: string
}

interface FileContent {
  path: string
  content: string
  sha: string
}

interface TreeItem {
  path: string
  type: 'file' | 'dir' | 'symlink' | 'submodule'
  sha: string
  size?: number
  name: string
}

/**
 * GitHub API service for managing public-website content
 */
export class GitHubService {
  private readonly octokit: Octokit
  private readonly config: GitHubConfig

  constructor(config: GitHubConfig) {
    this.config = config
    this.octokit = new Octokit({ auth: config.token })
  }

  /**
   * Get file tree for a specific path
   */
  getTree = (path: string = 'src/content') =>
    Effect.tryPromise({
      try: async () => {
        const { data } = await this.octokit.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path,
        })

        if (!Array.isArray(data)) {
          return [
            {
              path: data.path,
              type: data.type,
              sha: data.sha,
              size: data.size,
              name: data.name,
            } as TreeItem,
          ]
        }

        return data.map(
          item =>
            ({
              path: item.path,
              type: item.type,
              sha: item.sha,
              size: item.size,
              name: item.name,
            }) as TreeItem
        )
      },
      catch: error => new Error(`Failed to get tree: ${String(error)}`),
    })

  /**
   * Get file content
   */
  getFileContent = (path: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data } = await this.octokit.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
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

  /**
   * Update file content
   */
  updateFile = (
    path: string,
    content: string,
    sha: string,
    message: string
  ) =>
    Effect.tryPromise({
      try: async () => {
        const { data } = await this.octokit.repos.createOrUpdateFileContents({
          owner: this.config.owner,
          repo: this.config.repo,
          path,
          message,
          content: Buffer.from(content).toString('base64'),
          sha,
        })

        return data
      },
      catch: error => new Error(`Failed to update file: ${String(error)}`),
    })

  /**
   * Create new file
   */
  createFile = (path: string, content: string, message: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data } = await this.octokit.repos.createOrUpdateFileContents({
          owner: this.config.owner,
          repo: this.config.repo,
          path,
          message,
          content: Buffer.from(content).toString('base64'),
        })

        return data
      },
      catch: error => new Error(`Failed to create file: ${String(error)}`),
    })

  /**
   * Delete file
   */
  deleteFile = (path: string, sha: string, message: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data } = await this.octokit.repos.deleteFile({
          owner: this.config.owner,
          repo: this.config.repo,
          path,
          message,
          sha,
        })

        return data
      },
      catch: error => new Error(`Failed to delete file: ${String(error)}`),
    })
}

/**
 * Create GitHub service instance
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
