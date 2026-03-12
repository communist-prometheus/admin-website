import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'

/**
 * Create Vite plugin array.
 * @returns Array of Vite plugins
 */
export const createPlugins = () => [
  vue(),
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
