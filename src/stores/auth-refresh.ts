import {
  type RefreshHooks,
  startTokenRefresh,
} from '@/composables/useAuth/refresh-scheduler'
import type { User } from '@/types/user'

/**
 * Keep the proactive token-refresh scheduler running exactly while a user
 * is authenticated. Starting on login and halting on logout avoids
 * spurious refresh attempts — and logout loops — while signed out.
 * @param hooks - Refresh/dead callbacks driven by the scheduler
 * @returns A watcher to register against the user ref
 */
export const createRefreshManager = (
  hooks: RefreshHooks
): ((user: User | null) => void) => {
  let stop: (() => void) | undefined
  const start = (): void => {
    stop ??= startTokenRefresh(hooks)
  }
  const halt = (): void => {
    stop?.()
    stop = undefined
  }
  return (user: User | null): void => {
    void (user ? start() : halt())
  }
}
