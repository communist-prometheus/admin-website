import { fs, REPO_DIR } from '../git/fs'
import { loadGit } from '../git/load-git'
import { buildAuthOpts } from '../git/remote/build-auth-opts'
import { workerState } from '../state/state'
import { loadTracedHttp } from '../tracing/load-traced-http'
import { clearForcePending, hasForcePending } from './resolve-file'

const commitResolution = async (
  config: NonNullable<typeof workerState.config>
): Promise<void> => {
  const git = await loadGit()
  await git.commit({
    fs,
    dir: REPO_DIR,
    message: 'Resolve merge conflicts',
    author: {
      name: config.authorName ?? 'Admin',
      email: config.authorEmail ?? 'admin@prometheus.org',
    },
  })
}

const pushResolution = async (
  config: NonNullable<typeof workerState.config>,
  force: boolean
): Promise<void> => {
  const git = await loadGit()
  const http = await loadTracedHttp()
  const opts = buildAuthOpts(config, http)
  await git.push({ ...opts, force })
}

/**
 * Commit every staged resolution and push the merge commit to
 * the remote. Pushes with `force=true` (force-with-lease) when at
 * least one file was resolved via the `force-mine` strategy.
 * Returns the inferred force flag so the caller can audit.
 * @returns True when a force push was issued.
 */
export const finalizeResolution = async (): Promise<boolean> => {
  const config = workerState.config
  const force = hasForcePending()
  await (config === undefined
    ? Promise.resolve()
    : (async (): Promise<void> => {
        await commitResolution(config)
        await pushResolution(config, force)
      })())
  clearForcePending()
  return force
}
