export interface GitHubTreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url: string
}

export interface GitHubTreeResponse {
  sha: string
  url: string
  tree: readonly GitHubTreeItem[]
  truncated: boolean
}

export interface GitHubFileContent {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: 'file'
  content: string
  encoding: 'base64'
}

export interface CreateFileParams {
  readonly path: string
  readonly content: string
  readonly message: string
}

export interface UpdateFileParams {
  readonly path: string
  readonly content: string
  readonly message: string
  readonly sha: string
}
