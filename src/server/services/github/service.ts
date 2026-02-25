import { Octokit } from '@octokit/rest'
import { createFile } from './operations/create-file'
import { deleteFile } from './operations/delete-file'
import { getFileContent } from './operations/get-file'
import { getTree } from './operations/get-tree'
import { updateFile } from './operations/update-file'
import type { GitHubConfig } from './types'

export class GitHubService {
  private readonly octokit: Octokit
  private readonly config: GitHubConfig
  readonly getTree: ReturnType<typeof getTree>
  readonly getFileContent: ReturnType<typeof getFileContent>
  readonly updateFile: ReturnType<typeof updateFile>
  readonly createFile: ReturnType<typeof createFile>
  readonly deleteFile: ReturnType<typeof deleteFile>

  constructor(config: GitHubConfig) {
    this.config = config
    this.octokit = new Octokit({ auth: config.token })
    this.getTree = getTree(this.octokit, this.config)
    this.getFileContent = getFileContent(this.octokit, this.config)
    this.updateFile = updateFile(this.octokit, this.config)
    this.createFile = createFile(this.octokit, this.config)
    this.deleteFile = deleteFile(this.octokit, this.config)
  }
}
