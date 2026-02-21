import { Effect, pipe } from 'effect'

/**
 * Creates Vite dev server for SSR in development mode.
 * @param __dirname - Server directory path
 * @returns Effect containing Vite dev server instance
 */
export const setupViteDevServer = (__dirname: string) =>
  pipe(
    Effect.promise(() => import('vite')),
    Effect.flatMap(vite =>
      Effect.promise(() =>
        vite.createServer({
          server: { middlewareMode: true },
          appType: 'custom',
        })
      )
    )
  )
