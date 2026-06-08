import type { RouteRecordRaw } from 'vue-router'
import { ownerRoutes } from './owner-routes'

/** Routes outside the content management section. */
export const nonContentRoutes: RouteRecordRaw[] = [
  {
    path: '/tickets',
    name: 'tickets',
    meta: { requiresAuth: true },
    component: () => import('../views/TicketsView/TicketsView.vue'),
  },
  {
    path: '/tickets/:number(\\d+)',
    name: 'ticket-detail',
    meta: { requiresAuth: true },
    component: () => import('../views/TicketDetailView/TicketDetailView.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    meta: { requiresAuth: true },
    component: () => import('../views/SettingsView/SettingsView.vue'),
  },
  ...ownerRoutes,
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
    path: '/deploys/:runId(\\d+)',
    name: 'deploy-detail',
    meta: { requiresAuth: true },
    component: () => import('../views/DeployDetailView/DeployDetailView.vue'),
  },
]
