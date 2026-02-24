import './assets/tokens.css'
import './assets/mixins.css'
import './assets/main.css'
import './assets/theme.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { vChildren } from './directives/render'
import router from './router'

const app = createApp(App)

app.directive('children', vChildren)

app.use(createPinia())
app.use(router)

app.mount('#app')
