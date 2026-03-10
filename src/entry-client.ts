import './assets/styles/index.scss'

import { createApp } from './app'
import { registerServiceWorker } from './composables/useSWBridge/register-sw'

const { app, router } = createApp(false)

router.isReady().then(() => {
  app.mount('#app')
  registerServiceWorker()
})
