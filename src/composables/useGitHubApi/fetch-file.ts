import { Effect, pipe } from 'effect'
import type { GitHubFileContent } from './types'

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
