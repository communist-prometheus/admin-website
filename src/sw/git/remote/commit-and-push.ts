import { Effect } from 'effect'
import { ConfigMissingError } from '../../errors'
import { log } from '../../logging/logger'
import { recordOp } from '../../logging/metrics'
import { workerState } from '../../state/state'
import { isMock } from '../is-mock'
import { realCommit } from './real-commit'

const mockCommit = (message: string) =>
  Effect.sync(() => {
    log('info', 'git', `mock commit: ${message}`)
    recordOp('commitAndPush', 0)
    return 'mock'
  })

/**
 * Commit staged changes and push to remote.
 * In mock mode, skips git commit and push (FS-only).
 * @param message - Commit message
 * @returns The new commit SHA (or 'mock' in mock mode)
 */
export const commitAndPush = (message: string): Promise<string> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const config = yield* Effect.fromNullable(workerState.config).pipe(
        Effect.mapError(() => new ConfigMissingError({}))
      )
      return yield* isMock(config)
        ? mockCommit(message)
        : realCommit(config, message)
    })
  )
