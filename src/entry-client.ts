import './assets/styles/index.scss'

import { createApp } from './app'
import { registerWebComponents } from './registerWebComponents'

registerWebComponents()

const { app, router } = createApp(false)

router.isReady().then(() => {
  app.mount('#app')
})
