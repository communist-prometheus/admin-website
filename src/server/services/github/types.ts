/** GitHub configuration */
export interface GitHubConfig {
  owner: string
  repo: string
  token: string
  branch: string
}

/** File content */
export interface FileContent {
  path: string
  content: string
  sha: string
}

/** Tree item */
export interface TreeItem {
  path: string
  type: 'file' | 'dir' | 'symlink' | 'submodule'
  sha: string
  size?: number
  name: string
}
