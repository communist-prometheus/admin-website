import type { RouteRecordRaw } from 'vue-router'
import type { ContentType } from '@/types/content'

const CONTENT_SECTIONS: readonly ContentType[] = [
  'blog',
  'positions',
  'pages',
  'common',
  'newspaper',
]

const contentView = () => import('../views/ContentView.vue')

const sectionRoutes: RouteRecordRaw[] = CONTENT_SECTIONS.map(type => ({
  path: `/content/${type}`,
  name: `content-${type}`,
  meta: { requiresAuth: true },
  component: contentView,
  props: { contentType: type },
}))

/** Routes for content management (require authentication) */
export const contentRoutes: RouteRecordRaw[] = [
  ...sectionRoutes,
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
    path: '/content/:type/edit/:slug',
    name: 'content-edit',
    meta: { requiresAuth: true },
    component: () => import('../views/ContentEditView.vue'),
    props: true,
  },
]
