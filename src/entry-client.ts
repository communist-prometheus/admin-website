import './assets/styles/index.scss'

import { createApp } from './app'
import { registerServiceWorker } from './composables/useSWBridge/register-sw'

const { app, router } = createApp()

/**
 * Start SW registration in parallel with app mount.
 * The SW is pre-registered from the HTML template, so
 * this call returns the existing registration quickly.
 * Content loading awaits swReady (resolved by initSWWithToken).
 */
registerServiceWorker()
router.isReady().then(() => app.mount('#app'))
