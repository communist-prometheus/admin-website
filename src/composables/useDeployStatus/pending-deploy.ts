import { ref, watch } from 'vue'
import type { CommitBuild } from './check-runs'

const KEY = 'pending_deploy'

const load = (): CommitBuild | undefined => {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

/** Shared reactive ref for pending deploy after save. */
export const pendingDeploy = ref<CommitBuild | undefined>(load())

watch(pendingDeploy, v => {
  if (v) sessionStorage.setItem(KEY, JSON.stringify(v))
  else sessionStorage.removeItem(KEY)
})

/**
 * Set a pending deploy entry (shown instantly on home).
 * Persisted in sessionStorage to survive navigation.
 * @param message - Commit message from save
 */
export const setPendingDeploy = (message: string) => {
  pendingDeploy.value = {
    sha: '',
    message,
    author: 'you',
    date: new Date().toISOString(),
    check: undefined,
  }
}
