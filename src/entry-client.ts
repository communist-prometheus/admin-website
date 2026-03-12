import './assets/styles/index.scss'

import { createApp } from './app'
import { registerServiceWorker } from './composables/useSWBridge/register-sw'

const { app, router } = createApp(false)

/**
 * Register SW before mounting to ensure it is active
 * when the auth watcher fires initSWWithToken.
 * SW registration is fast (~50ms) and doesn't hurt FCP.
 */
registerServiceWorker().then(() =>
  router.isReady().then(() => app.mount('#app'))
)
