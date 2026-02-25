import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

export const createPlugins = () => [
  vue({
    customElement: /\.ce\.vue$/,
    template: {
      compilerOptions: {
        isCustomElement: (tag: string) => tag === 'app-layout',
      },
    },
  }),
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
    exclude: [/AppLayout\.vue$/, /AppLayout\.ce\.vue$/],
  }),
]
