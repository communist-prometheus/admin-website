import type { Ref } from 'vue'
import type { DeployState } from './deploy-state'
import type { Phase } from './poll-types'

/** Public surface of the poll loop. */
export interface LoopHandle {
  readonly start: () => Promise<void>
  readonly requestPoll: () => void
  readonly stop: () => void
  readonly onVisibility: () => void
  readonly phase: Ref<Phase>
}

/** Mutable loop state held by the closure factories. */
export interface LoopCtx {
  readonly state: DeployState
  readonly phase: Ref<Phase>
  timer: ReturnType<typeof setTimeout> | undefined
}

/** Single poll tick interval (ms). Applies while polling is active. */
export const POLL_INTERVAL_MS = 5000

/**
 * Check whether the tab is currently hidden.
 * @returns True when the Page Visibility API reports `document.hidden`
 */
export const visibilityHidden = (): boolean =>
  typeof globalThis.document !== 'undefined' && globalThis.document.hidden
