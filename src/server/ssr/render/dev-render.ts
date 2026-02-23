/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect, pipe } from 'effect'
import type { ViteDevServer } from 'vite'
import { loadDevRender } from '../loaders/dev'

/**
 * Prepare dev render with Vite
 */
export const prepareDevRender = (
  url: string,
  template: string,
  viteServer: ViteDevServer
) =>
  pipe(
    Effect.tryPromise({
      try: async () => await viteServer.transformIndexHtml(url, template),
      catch: () => new Error('Failed to transform HTML'),
    }),
    Effect.flatMap(transformedTemplate =>
      pipe(
        loadDevRender(viteServer),
        Effect.map(render => ({ template: transformedTemplate, render }))
      )
    )
  )
