import { Effect } from 'effect'
import { log } from '../../logging/logger'
import { recordOp } from '../../logging/metrics'
import { drainPushes, enqueue } from '../../push-queue'
import { workerState } from '../../state/state'
import { fs, REPO_DIR } from '../fs'
import { loadGit } from '../load-git'

type SWGitConfig = NonNullable<typeof workerState.config>

const commitLocally = async (
  config: SWGitConfig,
  message: string
): Promise<string> => {
  const git = await loadGit()
  return git.commit({
    fs,
    dir: REPO_DIR,
    message,
    author: {
      name: config.authorName ?? 'Admin',
      email: config.authorEmail ?? 'admin@prometheus.org',
    },
  })
}

const runCommitAndQueue = async (
  config: SWGitConfig,
  message: string
): Promise<string> => {
  const start = Date.now()
  const sha = await commitLocally(config, message)
  log('info', 'git', `committed ${sha.slice(0, 7)}`)
  workerState.commitSha = sha
  recordOp('commit', Date.now() - start)
  await enqueue({
    sha,
    branch: config.branch,
    message,
    enqueuedAt: Date.now(),
  })
  void drainPushes()
  return sha
}

/*
 * `Effect.tryPromise` without a `catch` rewrites the rejection into a
 * generic UnknownError whose `.message` reads "An unknown error
 * occurred in Effect.tryPromise". The handler at /api/github/commit
 * then bubbles that opaque text up to the user. We need the
 * underlying isomorphic-git reason so failed saves are diagnosable.
 * Coerce non-Error throws so callers always get a string-bearing
 * Error.
 */
const preserveError = (e: unknown): Error =>
  e instanceof Error ? e : new Error(String(e))

/**
 * Run a real git commit, enqueue the push, return the commit sha
 * to the caller without waiting for the network. The push is
 * processed by the background drain in `push-queue/drain.ts`.
 * @param config Validated SW git configuration.
 * @param message Commit message.
 * @returns Effect yielding the commit sha.
 */
export const realCommit = (config: SWGitConfig, message: string) =>
  Effect.tryPromise({
    try: () => runCommitAndQueue(config, message),
    catch: preserveError,
  })
