import type { RouteRecordRaw } from 'vue-router'

/** Route for deploy detail page */
export const deployRoute: RouteRecordRaw = {
  path: '/deploy/:sha',
  name: 'deploy-detail',
  meta: { requiresAuth: true },
  component: () => import('../views/DeployDetailView/DeployDetailView.vue'),
  props: true,
}
