import { Effect, pipe } from 'effect'
import type { CreateFileParams } from './types'

export const createFile = (params: CreateFileParams) =>
  pipe(
    Effect.tryPromise({
      try: () =>
        fetch('/api/github/file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        }),
      catch: () => new Error(`Failed to create file: ${params.path}`),
    }),
    Effect.flatMap(res =>
      Effect.tryPromise(() => res.json() as Promise<{ success: boolean }>)
    )
  )
