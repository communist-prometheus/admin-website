import type { BuildOptions } from 'vite'

export const buildConfig: BuildOptions = {
  manifest: true,
  cssCodeSplit: false,
  rolldownOptions: {
    output: {
      entryFileNames: 'assets/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]',
      manualChunks: id => {
        if (id.includes('node_modules')) {
          if (id.includes('vue') || id.includes('vue-router')) {
            return 'vue-vendor'
          }
          if (id.includes('marked')) return 'marked'
          return 'vendor'
        }
      },
    },
  },
}
