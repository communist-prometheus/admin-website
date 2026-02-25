import { Effect, pipe } from 'effect'
import type { UpdateFileParams } from './types'

/**
 * Update file in GitHub repository
 * @param params - File update parameters
 * @returns Effect with update result
 */
export const updateFile = (params: UpdateFileParams) =>
  pipe(
    Effect.tryPromise({
      try: () =>
        fetch('/api/github/file', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        }),
      catch: () => new Error(`Failed to update file: ${params.path}`),
    }),
    Effect.flatMap(res =>
      Effect.tryPromise(() => res.json() as Promise<{ success: boolean }>)
    )
  )
