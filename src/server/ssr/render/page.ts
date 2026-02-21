import { pipe } from 'effect'
import type { InitialState } from '@/types/user'
import { injectInitialState, injectPreloadLinks } from '../template'

/**
 * Renders complete HTML page by injecting app HTML, preload links, and initial state.
 * @param template - Base HTML template
 * @param appHtml - Rendered Vue application HTML
 * @param preloadLinks - Preload link tags for resources
 * @param initialState - Optional initial state for client hydration
 * @returns Complete HTML page string
 */
export const renderPage = (
  template: string,
  appHtml: string,
  preloadLinks: string,
  initialState?: InitialState
) =>
  pipe(
    template.replace('<!--ssr-outlet-->', appHtml),
    html => injectPreloadLinks(html, preloadLinks),
    html => injectInitialState(html, initialState)
  )

/**
 * Builds final page response with HTML and module information.
 * @param data - Rendered page data
 * @param data.template - HTML template string
 * @param data.appHtml - Rendered Vue application HTML
 * @param data.modules - Set of modules used during rendering
 * @param data.preloadLinks - Preload link tags
 * @param initialState - Optional initial state for client hydration
 * @returns Object with html string and modules set
 */
export const buildFinalPage = (
  {
    template,
    appHtml,
    modules,
    preloadLinks,
  }: {
    template: string
    appHtml: string
    modules: Set<string>
    preloadLinks: string
  },
  initialState?: InitialState
) => ({
  html: renderPage(template, appHtml, preloadLinks, initialState),
  modules,
})
