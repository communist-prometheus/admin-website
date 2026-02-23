/* eslint-disable jsdoc/require-returns */
import { Effect } from 'effect'

/**
 * Load production render function
 */
export const loadProdRender = () =>
  Effect.tryPromise({
    try: async () => {
      const module = await import(
        // @ts-expect-error - build output not available in dev mode
        '../../../dist/server/entry-server.js'
      )
      return module.render
    },
    catch: () => new Error('Failed to load production render function'),
  })
