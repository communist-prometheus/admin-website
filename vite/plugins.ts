import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

export const createPlugins = () => [
  vue(),
  vueDevTools(),
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
