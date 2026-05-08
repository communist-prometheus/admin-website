import './assets/styles/index.scss'

import { createApp } from './app'
import { applyTheme, readStoredTheme } from './composables/useTheme'
import { vChildren } from './directives/render'

applyTheme(readStoredTheme())

const { app } = createApp()

app.directive('children', vChildren)

app.mount('#app')
