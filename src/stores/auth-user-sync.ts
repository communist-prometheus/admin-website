import { type Ref, watch } from 'vue'
import type { User } from '@/types/user'
import { createRefreshManager } from './auth-refresh'
import { syncTokenToSW } from './auth-sync-sw'

interface UserSyncDeps {
  readonly user: Ref<User | null>
  readonly setUser: (u: User | null) => void
  readonly logout: () => void
}

/*
 * A rotated token is applied through setUser so the user watcher re-inits
 * the Service Worker with it; skip no-op updates to avoid a spurious SW
 * re-init and audit record.
 */
const buildApplyToken =
  (deps: UserSyncDeps) =>
  (token: string): void => {
    const current = deps.user.value
    void (current && token !== current.accessToken
      ? deps.setUser({ ...current, accessToken: token })
      : undefined)
  }

/**
 * Wire the authenticated-user side effects: mirror the token to the
 * Service Worker on every change, and keep the proactive refresh scheduler
 * running while signed in (renewed tokens flow back through setUser).
 * @param deps - User ref plus setUser/logout actions
 */
export const installUserSync = (deps: UserSyncDeps): void => {
  const manageRefresh = createRefreshManager({
    onRefreshed: buildApplyToken(deps),
    onDead: deps.logout,
  })
  watch(
    deps.user,
    u => {
      syncTokenToSW(u)
      manageRefresh(u)
    },
    { immediate: true }
  )
}
