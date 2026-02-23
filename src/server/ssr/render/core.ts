import { Effect, pipe } from 'effect'
import type { ViteDevServer } from 'vite'
import type { InitialState } from '@/types/user'
import { getRenderFunction } from '../loader'
import { getPreloadLinks } from '../preload'
import { loadTemplate } from '../template'

/**
 * Loads HTML template and render function based on environment.
 * @param isProduction - Whether running in production mode
 * @param __dirname - Server directory path
 * @param viteServer - Vite dev server instance (dev only)
 * @param clientManifest - Client build manifest (production only)
 * @returns Effect containing tuple of [template, renderFn]
 */
export const loadResources = (
  isProduction: boolean,
  __dirname: string,
  viteServer?: ViteDevServer,
  clientManifest?: Record<string, { file: string; css?: string[] }>
) =>
  Effect.all([
    Effect.tryPromise({
      try: async () =>
        await loadTemplate(
          isProduction,
          __dirname,
          viteServer,
          clientManifest
        ),
      catch: () => new Error('Failed to load template'),
    }),
    getRenderFunction(isProduction, viteServer),
  ])

/**
 * Renders Vue app with template and generates preload links.
 * @param template - HTML template string
 * @param renderFn - Vue SSR render function
 * @param url - Request URL to render
 * @param initialState - Optional initial state for hydration
 * @param ssrManifest - SSR manifest for preload link generation
 * @returns Effect containing rendered data with template, appHtml, modules, preloadLinks
 */
export const renderWithTemplate = (
  template: string,
  renderFn: (
    url: string,
    initialState?: InitialState
  ) => Promise<{ html: string; modules: Set<string> }>,
  url: string,
  initialState?: InitialState,
  ssrManifest?: Record<string, string[]>
) =>
  pipe(
    Effect.tryPromise(() => renderFn(url, initialState)),
    Effect.map(({ html: appHtml, modules }) => ({
      template,
      appHtml,
      modules,
      preloadLinks: getPreloadLinks(modules, ssrManifest),
    }))
  )
