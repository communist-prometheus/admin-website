/*
 * Full-reset orchestrator: nuke every locally-cached artefact and
 * reload with a fresh SW. Runs sequentially so a UI progress bar can
 * track each stage. Each step lives in its own file.
 *
 * Sequence:
 *   1. Wipe cloned git repo through the SW so its in-memory state
 *      (config, last-sync, commit-sha) is dropped too — otherwise the
 *      wiped filesystem would be immediately re-cloned with stale config.
 *   2. Drop every CacheStorage entry (SW precache + runtime caches).
 *   3. Drop every IndexedDB the origin owns.
 *   4. Clear localStorage + sessionStorage (includes the OAuth token —
 *      user is logged out on the next load).
 *   5. Unregister every ServiceWorkerRegistration and reload.
 */

import { sendSWMessage } from '../useSWBridge/send-message'
import { clearCaches } from './clear-caches'
import { clearAllIDB } from './clear-idb'
import { clearWebStorage } from './clear-storage'
import { unregisterAllSW } from './unregister-sw'

/** One step's payload published to the UI for the progress bar. */
export interface HardResetProgress {
  readonly step: number
  readonly total: number
  readonly label: string
}

interface Step {
  readonly label: string
  readonly run: () => Promise<void>
}

const swInvalidate = async (): Promise<void> => {
  await sendSWMessage({ type: 'SW_INVALIDATE' }).catch(() => undefined)
}

const STEPS: readonly Step[] = [
  { label: 'Wiping git repository…', run: swInvalidate },
  { label: 'Clearing HTTP caches…', run: clearCaches },
  { label: 'Clearing local databases…', run: clearAllIDB },
  { label: 'Clearing local storage…', run: clearWebStorage },
  { label: 'Unregistering service worker…', run: unregisterAllSW },
]

/**
 * Run the hard reset. Progress is reported synchronously BEFORE each
 * step starts so the UI can render the step label while the (possibly
 * slow) work runs.
 *
 * @param onProgress Callback invoked once per step, plus a final
 *   "Reloading…" tick right before `location.reload()`.
 * @returns Never resolves — the last step reloads the tab.
 */
export const runHardReset = async (
  onProgress: (p: HardResetProgress) => void
): Promise<void> => {
  const total = STEPS.length + 1
  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i] as Step
    onProgress({ step: i + 1, total, label: step.label })
    await step.run()
  }
  onProgress({ step: total, total, label: 'Reloading…' })
  location.reload()
}
