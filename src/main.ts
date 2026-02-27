import './assets/styles/index.scss'

import { createApp } from './app'
import { vChildren } from './directives/render'

const { app } = createApp(false)

app.directive('children', vChildren)

app.mount('#app')
