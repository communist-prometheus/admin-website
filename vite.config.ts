import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
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
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    manifest: true,
    cssCodeSplit: false,
    rolldownOptions: {
      input: './src/entry-client.ts',
      output: {
        assetFileNames: assetInfo => {
          if (assetInfo.names.includes('style.css')) return 'assets/style.css'
          return 'assets/[name]-[hash][extname]'
        },
        manualChunks: id => {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router')) {
              return 'vue-vendor'
            }
            if (id.includes('effect')) {
              return 'effect-vendor'
            }
            return 'vendor'
          }
        },
      },
    },
  },
})
