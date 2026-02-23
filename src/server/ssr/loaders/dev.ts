/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'
import type { ViteDevServer } from 'vite'

/**
 * Load dev render function
 */
export const loadDevRender = (viteServer: ViteDevServer) =>
  Effect.tryPromise({
    try: async () => {
      const module = await viteServer.ssrLoadModule('/src/entry-server.ts')
      return module.render
    },
    catch: () => new Error('Failed to load dev render function'),
  })
