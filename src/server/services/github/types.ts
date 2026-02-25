export interface GitHubConfig {
  owner: string
  repo: string
  token: string
}

export interface FileContent {
  path: string
  content: string
  sha: string
}

export interface TreeItem {
  path: string
  type: 'file' | 'dir' | 'symlink' | 'submodule'
  sha: string
  size?: number
  name: string
}
