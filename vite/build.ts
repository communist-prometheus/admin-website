import type { BuildOptions } from 'vite'

export const buildConfig: BuildOptions = {
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
}
