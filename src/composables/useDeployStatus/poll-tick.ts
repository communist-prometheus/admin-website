import { doTick } from './poll-do-tick'
import { allTerminal } from './poll-entries'
import type { PollContext } from './poll-types'

/**
 * Run one poll tick and decide whether to reschedule or pause.
 *
 * Pauses when every visible entry is terminal. Keeps the loop alive
 * on transient fetch errors — the next tick will retry.
 * @param ctx - Poll context
 */
export const runTick = async (ctx: PollContext): Promise<void> => {
  await doTick(ctx)
  if (allTerminal(ctx.state.entries.value)) {
    ctx.phase.value = 'paused'
    ctx.setTimer(undefined)
    return
  }
  ctx.schedule()
}

export { allTerminal, buildEntries, fetchJobsFor } from './poll-entries'
export type { Phase, PollContext } from './poll-types'
