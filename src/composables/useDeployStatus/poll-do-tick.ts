import { log } from '@/composables/useSWBridge/sw-log'
import { buildEntries, fetchJobsFor } from './poll-entries'
import type { PollContext } from './poll-types'
import { fetchWorkflowRuns } from './workflow-api'

/** Maximum workflow runs to request per tick. */
const RUNS_LIMIT = 15

/**
 * Fetch fresh runs + jobs and write them into state. Errors are
 * captured into `state.error` and the next tick retries.
 * @param ctx - Poll context holding the reactive state
 */
export const doTick = async (ctx: PollContext): Promise<void> => {
  try {
    const runs = await fetchWorkflowRuns(RUNS_LIMIT)
    await fetchJobsFor(runs, ctx.state.store)
    ctx.state.entries.value = buildEntries(runs, ctx.state.store)
    ctx.state.error.value = undefined
  } catch (e) {
    ctx.state.error.value = e instanceof Error ? e.message : 'fetch failed'
    log('warn', 'deploy-polling: tick failed', {
      error: ctx.state.error.value,
    })
  } finally {
    ctx.state.loading.value = false
  }
}
