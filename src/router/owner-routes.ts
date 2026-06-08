import type { RouteRecordRaw } from 'vue-router'

/** Routes that require the SSO `owner` role on top of authentication. */
export const ownerRoutes: RouteRecordRaw[] = [
  {
    path: '/comms',
    name: 'comms',
    meta: { requiresAuth: true, requiresOwner: true },
    component: () => import('../views/CommsView/CommsView.vue'),
  },
  {
    path: '/features',
    name: 'features',
    meta: { requiresAuth: true, requiresOwner: true },
    component: () => import('../views/FeaturesView/FeaturesView.vue'),
  },
]
