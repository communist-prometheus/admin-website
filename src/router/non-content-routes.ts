import type { RouteRecordRaw } from 'vue-router'

/** Routes outside the content management section. */
export const nonContentRoutes: RouteRecordRaw[] = [
  {
    path: '/tickets',
    name: 'tickets',
    meta: { requiresAuth: true },
    component: () => import('../views/TicketsView/TicketsView.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    meta: { requiresAuth: true },
    component: () => import('../views/SettingsView/SettingsView.vue'),
  },
  {
    path: '/conflicts',
    name: 'conflicts',
    meta: { requiresAuth: true },
    component: () => import('../views/ConflictsView/ConflictsView.vue'),
  },
  {
    path: '/conflicts/merge/:file(.+)',
    name: 'conflicts-merge',
    meta: { requiresAuth: true },
    component: () => import('../views/VisualMergeView/VisualMergeView.vue'),
  },
  {
    path: '/live-traces',
    name: 'live-traces',
    meta: { requiresAuth: true },
    component: () => import('../views/LiveTracesView/LiveTracesView.vue'),
  },
  {
    path: '/traces',
    name: 'traces',
    meta: { requiresAuth: true },
    component: () => import('../views/TracesView/TracesView.vue'),
  },
]
