import { Effect, pipe } from 'effect'
import type { ViteDevServer } from 'vite'
import type { InitialState } from '@/types/user'

type RenderFn = (
  url: string,
  initialState?: InitialState
) => Promise<{ html: string; modules: Set<string> }>

/**
 * Loads Vue SSR render function from production build or dev server.
 * @param isProduction - Whether running in production mode
 * @param viteServer - Vite dev server instance (required in dev mode)
 * @returns Effect containing render function or error
 */
export const getRenderFunction = (
  isProduction: boolean,
  viteServer?: ViteDevServer
): Effect.Effect<RenderFn, Error> =>
  isProduction
    ? Effect.tryPromise({
        try: async () => {
          const { render } =
            // @ts-expect-error - build output not available in dev
            await import('../../../dist/server/entry-server.js')
          return render
        },
        catch: () => new Error('Failed to load production render function'),
      })
    : pipe(
        Effect.fromNullable(viteServer),
        Effect.mapError(() => new Error('Vite server not initialized')),
        Effect.flatMap(vite =>
          Effect.tryPromise(() => vite.ssrLoadModule('/src/entry-server.ts'))
        ),
        Effect.map(module => module['render'])
      )
