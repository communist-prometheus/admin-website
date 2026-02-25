import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
  ],
})

export default router
