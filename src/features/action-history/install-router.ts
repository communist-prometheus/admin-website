import type { Router } from 'vue-router'
import { recordAction } from './recorder'

/**
 * Install an `afterEach` hook on the router that records every
 * navigation as an action-history entry.
 *
 * Uses `afterEach` rather than `beforeEach` so we only record
 * navigations that actually completed (a guard that returns
 * `false` won't be recorded as a bogus event).
 *
 * @param router - Vue Router instance
 */
export const installRouterRecording = (router: Router): void => {
  router.afterEach((to, from) => {
    void recordAction({
      kind: 'navigation',
      from: from.fullPath,
      to: to.fullPath,
    })
  })
}
