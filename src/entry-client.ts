import './assets/tokens.css'
import './assets/mixins.css'
import './assets/main.css'
import './assets/theme.css'

import { createApp } from './app'

const { app, router } = createApp(false)

router.isReady().then(() => {
  app.mount('#app')
})
