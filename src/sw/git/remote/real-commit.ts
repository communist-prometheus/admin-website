import { Effect } from 'effect'
import { log } from '../../logging/logger'
import { workerState } from '../../state/state'
import { execCommit } from './exec-commit'

type SWGitConfig = NonNullable<typeof workerState.config>

/**
 * Execute real git commit + push to remote.
 * @param config - Validated SW git configuration
 * @param message - Commit message
 * @returns Effect yielding the commit SHA
 */
export const realCommit = (config: SWGitConfig, message: string) =>
  Effect.tryPromise({
    try: () => execCommit(config, message),
    catch: (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e)
      log('error', 'git', `commit failed: ${msg}`)
      return new Error(`Commit failed: ${msg}`)
    },
  })
