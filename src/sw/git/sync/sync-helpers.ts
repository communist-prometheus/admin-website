import { Effect } from 'effect'
import { log } from '../../logging/logger'
import type { SWGitConfig } from '../../protocol'
import { workerState } from '../../state/state'
import { fs, REPO_DIR } from '../fs'
import { isMock } from '../is-mock'
import { initMockRepo } from '../repo/init-mock-repo'
import { markReady } from './mark-ready'
import { wipeRepo } from './wipe-repo'

const checkMockReady = Effect.tryPromise(() =>
  fs.promises.readdir(REPO_DIR).then(e => e.length > 0)
).pipe(Effect.catchAll(() => Effect.succeed(false)))

/**
 * Check whether the repo already exists on disk.
 * @param config - SW git configuration
 * @returns Effect resolving true if repo exists
 */
export const repoExists = (config: SWGitConfig) =>
  isMock(config)
    ? checkMockReady
    : Effect.tryPromise(async () => {
        const m = await import('../repo/check-repo-exists')
        return m.checkRepoExists()
      })

/**
 * Wipe IndexedDB and clone fresh from remote.
 * @param config - SW git configuration
 * @returns Effect performing the fresh clone
 */
/**
 * Preserve the original error when Effect.tryPromise wraps a clone
 * failure. Without this, the real root cause (SmartHttpError from
 * isomorphic-git, TypeError from a missing browser polyfill, etc.)
 * is erased and logged as "An unknown error occurred in
 * Effect.tryPromise" — masking a month-old regression for weeks.
 * @param e - Raw error from inside the tryPromise body
 * @returns Error with a readable message
 */
const toCloneError = (e: unknown): Error => {
  const msg = e instanceof Error ? e.message : JSON.stringify(e)
  log('error', 'git', `freshClone failed: ${msg}`)
  return e instanceof Error ? e : new Error(msg)
}

/**
 * Execute the wipe + mkdir + clone pipeline in one place so it can be
 * wrapped by `Effect.tryPromise`'s `try` without inlining the closure.
 * @param config - SW git configuration
 */
const performFreshClone = async (config: SWGitConfig): Promise<void> => {
  workerState.state = 'cloning'
  await wipeRepo()
  await fs.promises.mkdir(REPO_DIR).catch(() => {})
  const { cloneRepo } = await import('./clone/clone-repo')
  await cloneRepo(config)
  markReady('SW state → ready (fresh clone)')
}

/**
 * Wipe IndexedDB and clone fresh from remote, preserving the raw
 * clone error instead of the generic Effect wrapper message.
 * @param config - SW git configuration
 * @returns Effect performing the fresh clone
 */
export const freshClone = (config: SWGitConfig) =>
  Effect.tryPromise({
    try: () => performFreshClone(config),
    catch: toCloneError,
  })

/** Wipe IndexedDB and initialize with mock data. */
export const initMock = Effect.tryPromise(async () => {
  workerState.state = 'cloning'
  await wipeRepo()
  await fs.promises.mkdir(REPO_DIR).catch(() => {})
  await initMockRepo()
  markReady('SW state → ready')
})
