import './assets/styles/index.scss'

import { createApp } from './app'
import { applyTheme, readStoredTheme } from './composables/useTheme'
import { installVisualViewportBinding } from './composables/useVisualViewport/bind-viewport'
import { vChildren } from './directives/render'

applyTheme(readStoredTheme())
installVisualViewportBinding()

const { app } = createApp()

app.directive('children', vChildren)

app.mount('#app')
