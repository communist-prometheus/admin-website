import type { Ref } from 'vue'
import { fetchCheckRun } from './check-runs'
import { ghFetch } from './gh-fetch'
import type { DeployInfo } from './types'

const REPO = 'communist-prometheus/public-website'

interface HeadCommit {
  readonly sha: string
}

/**
 * Create poll function for GitHub Check Runs.
 * @param info - Reactive deploy info
 * @param getSha - Getter for tracked commit SHA
 * @param setSha - Setter for tracked commit SHA
 * @param stop - Stop polling callback
 * @returns Async poll function
 */
export const createCheckRunPoll =
  (
    info: Ref<DeployInfo>,
    getSha: () => string,
    setSha: (s: string) => void,
    stop: () => void
  ) =>
  async () => {
    if (!getSha()) {
      const h = await ghFetch<HeadCommit>(`/repos/${REPO}/commits/master`)
      if (h) setSha(h.sha)
      return
    }
    const run = await fetchCheckRun(getSha())
    if (!run) return
    if (run.status === 'completed') {
      info.value = { stage: 'success', createdOn: run.completed_at }
      stop()
    }
  }
