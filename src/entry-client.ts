import './assets/styles/index.scss'

import { createApp } from './app'

const { app, router } = createApp(false)

router.isReady().then(() => {
  app.mount('#app')
})
