import { type Ref, ref } from 'vue'
import { type HardResetProgress, runHardReset } from './hard-reset'

interface HardResetState {
  readonly running: boolean
  readonly progress: HardResetProgress | undefined
  readonly error: string | undefined
  readonly start: () => Promise<void>
}

interface Slots {
  readonly running: Ref<boolean>
  readonly progress: Ref<HardResetProgress | undefined>
  readonly error: Ref<string | undefined>
}

const runOnce = async (s: Slots): Promise<void> => {
  s.running.value = true
  s.error.value = undefined
  try {
    await runHardReset(p => {
      s.progress.value = p
    })
    /* No `finally { running = false }` — a successful run reloads. */
  } catch (e) {
    s.error.value = e instanceof Error ? e.message : String(e)
    s.running.value = false
  }
}

const makeStart =
  (s: Slots): (() => Promise<void>) =>
  async () =>
    s.running.value ? undefined : runOnce(s)

/**
 * Vue composable wrapping the sequential hard-reset routine. Publishes
 * reactive `running`/`progress`/`error` flags for a progress-bar UI. The
 * last step of a successful run calls `location.reload()`, so consumers
 * do not need to react to a "done" state — the whole page unmounts.
 *
 * @returns Reactive state + `start()` method.
 */
export const useHardReset = (): HardResetState => {
  const running = ref(false)
  const progress = ref<HardResetProgress | undefined>(undefined)
  const error = ref<string | undefined>(undefined)
  const start = makeStart({ running, progress, error })
  return {
    get running() {
      return running.value
    },
    get progress() {
      return progress.value
    },
    get error() {
      return error.value
    },
    start,
  }
}
