import type { Plugin } from 'vite'
import { addSWEntry } from './sw-entry'
import { replaceSWVersion } from './sw-version-replace'

/**
 * Vite plugin that builds the Service Worker as a separate entry.
 * @returns Vite plugin
 */
export const swPlugin = (): Plugin => ({
  name: 'sw-builder',
  apply: 'build',
  generateBundle(_options, bundle) {
    replaceSWVersion(bundle)
  },
  config(config) {
    addSWEntry(config)
  },
})
