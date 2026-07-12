import type { Ref } from 'vue'
import type { ForceDispatchResult } from '@/stores/dispatch-api'
import type {
  FailedRecipient,
  FailedRecipientList,
} from '@/validation/schemas/run-log'

/** Where the retry-failed panel is in its lifecycle. */
export type RetryPhase = 'idle' | 'confirm' | 'sending' | 'done' | 'error'

/** The API calls + parent callback the actions are built over. */
export type RetryDeps = {
  readonly list: () => Promise<FailedRecipientList>
  readonly dispatch: (ids?: readonly number[]) => Promise<ForceDispatchResult>
  readonly onDone: () => void
}

/** Reactive refs the actions read + write. */
export type RetryRefs = {
  readonly recipients: Ref<readonly FailedRecipient[]>
  readonly phase: Ref<RetryPhase>
  readonly loading: Ref<boolean>
  readonly error: Ref<string | undefined>
  readonly result: Ref<ForceDispatchResult | undefined>
}
