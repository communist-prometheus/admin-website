import { Effect, pipe } from 'effect'

/**
 * Creates Vite dev server for SSR in development mode.
 * @param __dirname - Server directory path
 * @returns Effect containing Vite dev server instance
 */
export const setupViteDevServer = (__dirname: string) =>
  pipe(
    Effect.tryPromise({
      try: async () => await import('vite'),
      catch: () => new Error('Failed to import vite'),
    }),
    Effect.flatMap(vite =>
      Effect.tryPromise({
        try: async () =>
          await vite.createServer({
            server: { middlewareMode: true },
            appType: 'custom',
          }),
        catch: () => new Error('Failed to create Vite server'),
      })
    )
  )
