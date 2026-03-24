import type { RouteRecordRaw } from 'vue-router'

/** Routes for content management (require authentication) */
export const contentRoutes: RouteRecordRaw[] = [
  {
    path: '/content/blog',
    name: 'content-blog',
    meta: { requiresAuth: true },
    component: () => import('../views/ContentView.vue'),
    props: { contentType: 'blog' },
  },
  {
    path: '/content/pages',
    name: 'content-pages',
    meta: { requiresAuth: true },
    component: () => import('../views/ContentView.vue'),
    props: { contentType: 'pages' },
  },
  {
    path: '/content/positions',
    name: 'content-positions',
    meta: { requiresAuth: true },
    component: () => import('../views/ContentView.vue'),
    props: { contentType: 'positions' },
  },
  {
    path: '/content/common',
    name: 'content-common',
    meta: { requiresAuth: true },
    component: () => import('../views/ContentView.vue'),
    props: { contentType: 'common' },
  },
  {
    path: '/settings',
    name: 'settings',
    meta: { requiresAuth: true },
    component: () => import('../views/SettingsView/SettingsView.vue'),
  },
  {
    path: '/content/:type/edit/:slug',
    name: 'content-edit',
    meta: { requiresAuth: true },
    component: () => import('../views/ContentEditView.vue'),
    props: true,
  },
]
