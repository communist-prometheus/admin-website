import { Effect, pipe } from 'effect'
import type { ViteDevServer } from 'vite'
import type { InitialState } from '@/types/user'
import { loadResources, renderWithTemplate } from './render/core'
import { buildFinalPage } from './render/page'

/**
 * Creates SSR renderer function with configured resources.
 * @param isProduction - Whether running in production mode
 * @param __dirname - Server directory path
 * @param viteServer - Vite dev server instance (dev only)
 * @param ssrManifest - SSR manifest for preload links (production only)
 * @param clientManifest - Client build manifest (production only)
 * @returns Effect containing renderer function
 */
export const createRenderer = (
  isProduction: boolean,
  __dirname: string,
  viteServer?: ViteDevServer,
  ssrManifest?: Record<string, string[]>,
  clientManifest?: Record<string, { file: string; css?: string[] }>
) =>
  Effect.succeed((url: string, initialState?: InitialState) =>
    pipe(
      loadResources(isProduction, __dirname, viteServer, clientManifest),
      Effect.flatMap(([template, renderFn]) =>
        renderWithTemplate(template, renderFn, url, initialState, ssrManifest)
      ),
      Effect.map(data => buildFinalPage(data, initialState)),
      Effect.runPromise
    )
  )
