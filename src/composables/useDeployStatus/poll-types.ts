import type { Ref } from 'vue'
import type { DeployState } from './deploy-state'

/** Phase of the poll loop. */
export type Phase = 'idle' | 'polling' | 'paused'

/** Context passed to the poll tick so it can reschedule itself. */
export interface PollContext {
  readonly state: DeployState
  readonly phase: Ref<Phase>
  readonly setTimer: (t: ReturnType<typeof setTimeout> | undefined) => void
  readonly schedule: () => void
  readonly isWaitingForRun: () => boolean
}
