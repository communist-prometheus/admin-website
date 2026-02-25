import { Effect, pipe } from 'effect'
import type { GitHubFileContent } from './types'

/**
 * Fetch file content from GitHub
 * @param path - File path
 * @returns Effect with file content
 */
export const fetchFile = (path: string) =>
  pipe(
    Effect.tryPromise({
      try: () => fetch(`/api/github/file?path=${encodeURIComponent(path)}`),
      catch: () => new Error(`Failed to fetch file: ${path}`),
    }),
    Effect.flatMap(res =>
      Effect.tryPromise(() => res.json() as Promise<GitHubFileContent>)
    )
  )
