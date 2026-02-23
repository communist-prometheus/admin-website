/* eslint-disable jsdoc/require-returns */
import { Effect } from 'effect'

/**
 * Load production render function
 */
export const loadProdRender = () =>
  Effect.promise(() =>
    import(
      // @ts-expect-error - build output not available in dev mode
      '../../../dist/server/entry-server.js'
    ).then(m => m.render)
  )
