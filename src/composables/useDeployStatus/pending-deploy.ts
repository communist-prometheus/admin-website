import { ref, watch } from 'vue'
import type { PendingDeploy } from './pending-deploy-types'

export {
  isPendingMatched,
  pendingToDeployBuild,
} from './pending-deploy-projection'
export type { PendingDeploy } from './pending-deploy-types'

const KEY = 'pending_deploy'

const load = (): PendingDeploy | undefined => {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as PendingDeploy
  } catch {
    return undefined
  }
}

/** Shared reactive ref for pending deploy after save. */
export const pendingDeploy = ref<PendingDeploy | undefined>(load())

watch(pendingDeploy, v => {
  if (v) sessionStorage.setItem(KEY, JSON.stringify(v))
  else sessionStorage.removeItem(KEY)
})

/**
 * Set a pending deploy entry shown instantly on the home list.
 * Persisted in sessionStorage so navigation mid-flight does not
 * drop the user's visible feedback.
 * @param message - Commit message from save
 */
export const setPendingDeploy = (message: string): void => {
  pendingDeploy.value = {
    id: `pending-${Date.now()}`,
    message,
    createdAt: new Date().toISOString(),
  }
}

/** Clear the pending deploy once the real run lands. */
export const clearPendingDeploy = (): void => {
  pendingDeploy.value = undefined
}
