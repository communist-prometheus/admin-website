import type { HttpClient } from 'isomorphic-git'

import { log } from '../../../logging/logger'
import {
  SW_PROGRESS_CHANNEL,
  type SWGitConfig,
  type SWProgressEvent,
} from '../../../protocol'
import { fs, REPO_DIR } from '../../fs'

/**
 * Broadcasts a clone/pull progress event to any listening client so the UI can
 * show a real progress bar with the current phase instead of an opaque spinner.
 * A single lazily-created channel is reused; failures are swallowed (progress is
 * best-effort telemetry, never allowed to break the git op).
 */
let progressChannel: BroadcastChannel | undefined
const postProgress = (event: SWProgressEvent): void => {
  try {
    progressChannel ??= new BroadcastChannel(SW_PROGRESS_CHANNEL)
    progressChannel.postMessage(event)
  } catch {
    /* no BroadcastChannel (or closed) — progress is non-essential */
  }
}

/**
 * Build isomorphic-git clone options from config.
 * @param config - Repository configuration
 * @param http - HTTP client for isomorphic-git
 * @returns clone options object
 */
export const buildCloneOptions = (config: SWGitConfig, http: HttpClient) => ({
  fs,
  http,
  dir: REPO_DIR,
  url: `https://github.com/${config.owner}/${config.repo}`,
  corsProxy: config.corsProxy,
  ref: config.branch,
  singleBranch: true,
  depth: 1,
  onAuth: () => ({
    username: config.token,
    password: 'x-oauth-basic',
  }),
  onProgress: (e: { phase: string; loaded: number; total: number }) => {
    log('debug', 'git', e.phase, {
      loaded: e.loaded,
      total: e.total,
    })
    postProgress({ phase: e.phase, loaded: e.loaded, total: e.total })
  },
})
