import { Effect } from 'effect'
import { log } from '../../logging/logger'
import { recordOp } from '../../logging/metrics'
import { workerState } from '../../state/state'
import { fs, REPO_DIR } from '../fs'
import { loadGit } from '../load-git'

type SWGitConfig = NonNullable<typeof workerState.config>

const runCommit = async (
  config: SWGitConfig,
  message: string
): Promise<string> => {
  const start = Date.now()
  const git = await loadGit()
  const sha = await git.commit({
    fs,
    dir: REPO_DIR,
    message,
    author: {
      name: config.authorName ?? 'Admin',
      email: config.authorEmail ?? 'admin@prometheus.org',
    },
  })
  log('info', 'git', `committed ${sha.slice(0, 7)}`)
  const { pushToRemote } = await import('./push-to-remote')
  await pushToRemote(config)
  workerState.commitSha = sha
  recordOp('commitAndPush', Date.now() - start)
  return sha
}

/*
 * `Effect.tryPromise` without a `catch` rewrites the rejection into a
 * generic UnknownError whose `.message` reads "An unknown error
 * occurred in Effect.tryPromise". The handler at /api/github/commit
 * then bubbles that opaque text up to the user. We need the
 * underlying isomorphic-git reason ("not a fast-forward",
 * "401 Unauthorized", "RPC failed with HTTP 422", etc.) so failed
 * saves are diagnosable. Coerce non-Error throws so callers always
 * get a string-bearing Error.
 */
const preserveError = (e: unknown): Error =>
  e instanceof Error ? e : new Error(String(e))

/**
 * Execute real git commit + push to remote.
 * @param config - Validated SW git configuration
 * @param message - Commit message
 * @returns Effect yielding the commit SHA
 */
export const realCommit = (config: SWGitConfig, message: string) =>
  Effect.tryPromise({
    try: () => runCommit(config, message),
    catch: preserveError,
  })
