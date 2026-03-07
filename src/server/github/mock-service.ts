import { Effect } from 'effect'
import type { ContentType, GitHubFileContent } from '@/types/github-content'
import {
  createMockStorage,
  mockEntriesByType,
} from '../services/github/mock-data'

const toGitHubFileContent = (entry: {
  path: string
  name: string
  content: string
  sha: string
}): GitHubFileContent => ({
  name: entry.name,
  path: entry.path,
  sha: entry.sha,
  size: entry.content.length,
  url: '',
  html_url: '',
  git_url: '',
  download_url: null,
  type: 'file',
  content: Buffer.from(entry.content).toString('base64'),
  encoding: 'base64',
})

/** Mock GitHub content service for high-level routes */
export class MockContentService {
  private readonly storage = createMockStorage()

  readonly listContent = (type: ContentType) =>
    Effect.succeed((mockEntriesByType[type] || []).map(toGitHubFileContent))

  readonly getFile = (path: string) => {
    const file = this.storage.get(path)
    if (!file) {
      return Effect.fail(new Error(`File not found: ${path}`))
    }
    return Effect.succeed({
      content: file.content,
      sha: file.sha,
      path,
    })
  }

  readonly updateFile = (
    path: string,
    content: string,
    _message: string,
    sha?: string
  ) => {
    const existing = this.storage.get(path)
    if (existing && sha && existing.sha !== sha) {
      return Effect.fail(new Error('SHA mismatch'))
    }
    const newSha = `mock-sha-${Date.now()}`
    this.storage.set(path, { content, sha: newSha })
    return Effect.succeed({ commit: { sha: newSha } })
  }

  readonly deleteFile = (path: string, _message: string, sha: string) => {
    const existing = this.storage.get(path)
    if (!existing) {
      return Effect.fail(new Error('File not found'))
    }
    if (existing.sha !== sha) {
      return Effect.fail(new Error('SHA mismatch'))
    }
    this.storage.delete(path)
    return Effect.succeed({ commit: { sha: 'deleted' } })
  }
}
