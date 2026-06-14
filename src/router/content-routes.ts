import type { RouteRecordRaw } from 'vue-router'
import type { ContentType } from '@/types/content'
import { nonContentRoutes } from './non-content-routes'

const CONTENT_SECTIONS: readonly ContentType[] = [
  'blog',
  'positions',
  'pages',
  'common',
  'newspaper',
  'archive',
]

const contentView = () => import('../views/ContentView.vue')

const sectionRoutes: RouteRecordRaw[] = CONTENT_SECTIONS.map(type => ({
  path: `/content/${type}`,
  name: `content-${type}`,
  meta: { requiresAuth: true },
  component: contentView,
  props: { contentType: type },
}))

const editRoute: RouteRecordRaw = {
  path: '/content/:type/edit/:slug',
  name: 'content-edit',
  meta: { requiresAuth: true },
  component: () => import('../views/ContentEditView.vue'),
  props: true,
}

/** Routes for content management (require authentication) */
export const contentRoutes: RouteRecordRaw[] = [
  ...sectionRoutes,
  ...nonContentRoutes,
  editRoute,
]
