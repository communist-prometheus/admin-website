import { createSSRApp } from 'vue'
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import type { Router, RouterHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'

export const createApp = (isSSR: boolean) => {
  const app = createSSRApp(App)

  const history: RouterHistory = isSSR
    ? createMemoryHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL)

  const router: Router = createRouter({
    history,
    routes: [
      {
        path: '/',
        name: 'home',
        component: HomeView,
      },
      {
        path: '/about',
        name: 'about',
        component: () => import('./views/AboutView.vue'),
      },
    ],
  })

  app.use(router)

  return { app, router }
}
