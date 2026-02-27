import { createPinia } from 'pinia'
import { createSSRApp } from 'vue'
import type { Router } from 'vue-router'
import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from 'vue-router'
import App from './App.vue'
import { routes } from './router'

/**
 * Creates Vue application instance with router for SSR or client.
 * @param isSSR - Whether running in SSR mode (uses memory history) or client (web history)
 * @returns Object containing app instance and router
 */
export const createApp = (isSSR: boolean) => {
  const app = createSSRApp(App)
  const pinia = createPinia()

  const history = isSSR
    ? createMemoryHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL)

  const router: Router = createRouter({
    history,
    routes,
  })

  app.use(pinia)
  app.use(router)

  return { app, router }
}
