import type { RunDispatchDeps } from './types'

/**
 * Record that a tick fired and found nothing to carry.
 *
 * Without it such a tick leaves no `send_log` row at all, so the
 * editor's journal shows a gap that reads exactly like a cron that
 * stopped firing. The marker belongs to no recipient — `subscriberId`
 * is absent and `articleCount` is zero.
 * @param d Dispatch deps.
 * @returns Nothing — side effect only.
 */
export const recordIdleTick = async (d: RunDispatchDeps): Promise<void> => {
  await d.sendLogRepo.append({
    subscriberId: undefined,
    tickAt: d.tickAt.toISOString(),
    articleCount: 0,
    status: 'skipped',
    resendId: undefined,
    error: undefined,
  })
}
