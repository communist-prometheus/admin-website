import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/auth/github/callback',
    name: 'auth-callback',
    component: () => import('../views/AuthCallbackView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/content/blog',
    name: 'content-blog',
    component: () => import('../views/ContentView.vue'),
    props: { contentType: 'blog' },
  },
  {
    path: '/content/pages',
    name: 'content-pages',
    component: () => import('../views/ContentView.vue'),
    props: { contentType: 'pages' },
  },
  {
    path: '/content/positions',
    name: 'content-positions',
    component: () => import('../views/ContentView.vue'),
    props: { contentType: 'positions' },
  },
  {
    path: '/content/:type/edit/:slug',
    name: 'content-edit',
    component: () => import('../views/ContentEditView.vue'),
    props: true,
  },
]
