import { Effect, pipe } from 'effect'
import type { GitHubTreeResponse } from './types'

export const fetchTree = (path = '') =>
  pipe(
    Effect.tryPromise({
      try: () => fetch(`/api/github/tree?path=${encodeURIComponent(path)}`),
      catch: () => new Error('Failed to fetch tree'),
    }),
    Effect.flatMap(res =>
      Effect.tryPromise(() => res.json() as Promise<GitHubTreeResponse>)
    )
  )
