/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'
import type { ViteDevServer } from 'vite'

/**
 * Load dev render function
 */
export const loadDevRender = (viteServer: ViteDevServer) =>
  Effect.promise(() =>
    viteServer.ssrLoadModule('/src/entry-server.ts').then(m => m.render)
  )
