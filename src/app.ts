import { createSSRApp } from 'vue'
import type { Router, RouterHistory } from 'vue-router'
import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'

/**
 * Creates Vue application instance with router for SSR or client.
 * @param isSSR - Whether running in SSR mode (uses memory history) or client (web history)
 * @returns Object containing app instance and router
 */
export const createApp = (isSSR: boolean) => {
  const app = createSSRApp(App)

  app.config.compilerOptions.isCustomElement = (tag: string) => {
    return tag === 'app-layout'
  }

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
