import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { swPlugin } from './sw-plugin'

/**
 * Create Vite plugin array.
 * @returns Array of Vite plugins
 */
export const createPlugins = () => [
  vue(),
  vueDevTools(),
  swPlugin(),
  Components({
    dts: 'src/components.d.ts',
    directives: false,
    types: [
      {
        from: 'vue-router',
        names: ['RouterLink', 'RouterView'],
      },
    ],
  }),
]
