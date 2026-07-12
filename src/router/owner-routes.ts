import type { RouteRecordRaw } from 'vue-router'

/**
 * Newsletter is split into sub-routes for the same reason Settings was:
 * the schedule, a 120-row subscriber list, and a send log that carries a
 * row per recipient per tick do not belong on one scrolling page. Each
 * tab owns a URL, so a tab can be linked to directly. `/comms` redirects
 * to the first tab so old bookmarks still land somewhere.
 */
const commsRoute: RouteRecordRaw = {
  path: '/comms',
  meta: { requiresAuth: true, requiresOwner: true },
  component: () => import('../views/CommsView/CommsLayout.vue'),
  redirect: '/comms/settings',
  children: [
    {
      path: 'settings',
      name: 'comms-settings',
      component: () => import('../views/CommsView/pages/SettingsPage.vue'),
    },
    {
      path: 'subscribers',
      name: 'comms-subscribers',
      component: () => import('../views/CommsView/pages/SubscribersPage.vue'),
    },
    {
      path: 'log',
      name: 'comms-log',
      component: () => import('../views/CommsView/pages/LogPage.vue'),
    },
  ],
}

/** Routes that require the SSO `owner` role on top of authentication. */
export const ownerRoutes: RouteRecordRaw[] = [
  commsRoute,
  {
    path: '/features',
    name: 'features',
    meta: { requiresAuth: true, requiresOwner: true },
    component: () => import('../views/FeaturesView/FeaturesView.vue'),
  },
]
