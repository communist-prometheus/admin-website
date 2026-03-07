import { Effect } from 'effect'
import { allMockEntries, createMockStorage } from './mock-data'
import type { FileContent, TreeItem } from './types'

/** In-memory GitHub service for E2E tests */
export class MockGitHubService {
  private readonly storage: Map<string, { content: string; sha: string }>

  /** Initialize mock storage from shared data */
  constructor() {
    this.storage = createMockStorage()
  }

  readonly getTree = (path: string = 'src/content') => {
    const items: TreeItem[] = []
    for (const entry of allMockEntries) {
      if (!entry.path.startsWith(path)) continue
      const stored = this.storage.get(entry.path)
      if (stored) {
        items.push({
          path: entry.path,
          type: 'file',
          sha: stored.sha,
          size: entry.content.length,
          name: entry.name,
        })
      }
    }
    return Effect.succeed(items)
  }

  readonly getFileContent = (path: string) => {
    const file = this.storage.get(path)
    if (!file) {
      return Effect.fail(new Error(`File not found: ${path}`))
    }
    return Effect.succeed({
      path,
      content: file.content,
      sha: file.sha,
    } satisfies FileContent)
  }

  readonly updateFile = (
    path: string,
    content: string,
    _sha: string,
    _message: string
  ) => {
    const newSha = `mock-sha-${Date.now()}`
    this.storage.set(path, {
      content,
      sha: newSha,
    })
    return Effect.succeed({
      content: { sha: newSha },
      commit: { sha: newSha },
    })
  }

  readonly createFile = (path: string, content: string, _message: string) => {
    const newSha = `mock-sha-${Date.now()}`
    this.storage.set(path, {
      content,
      sha: newSha,
    })
    return Effect.succeed({
      content: { sha: newSha },
      commit: { sha: newSha },
    })
  }

  readonly deleteFile = (path: string, _sha: string, _message: string) => {
    this.storage.delete(path)
    return Effect.succeed({
      commit: { sha: 'deleted' },
    })
  }
}
