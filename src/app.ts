import { createPinia } from 'pinia'
import { createApp as vueCreateApp } from 'vue'
import type { Router } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { routes } from './router'
import { installAuthGuard } from './router/auth-guard'

/**
 * Creates Vue application instance with router.
 * @returns Object containing app instance and router
 */
export const createApp = () => {
  const app = vueCreateApp(App)
  const pinia = createPinia()

  const router: Router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  })

  installAuthGuard(router)

  app.use(pinia)
  app.use(router)

  return { app, router }
}
