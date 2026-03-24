export type {
  GitHubFileContent,
  GitHubTreeItem,
  GitHubTreeResponse,
} from '@/validation/schemas/github-api'

/** Parameters for creating a file */
export interface CreateFileParams {
  readonly path: string
  readonly content: string
  readonly message: string
}

/** Parameters for updating a file */
export interface UpdateFileParams {
  readonly path: string
  readonly content: string
  readonly message: string
  readonly sha: string
}
