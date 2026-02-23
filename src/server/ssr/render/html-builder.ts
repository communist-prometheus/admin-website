/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect, pipe } from 'effect'
import type { InitialState } from '../../../types/user'
import { generatePreloadLinks } from '../helpers/preload-links'
import { injectInitialState } from '../helpers/template'

/**
 * Build final HTML with SSR content
 */
export const buildHtml = (
  template: string,
  render: (
    url: string,
    initialState?: InitialState
  ) => Promise<{ html: string; modules: Set<string> }>,
  url: string,
  initialState: InitialState | undefined,
  ssrManifest: Record<string, string[]> | undefined
) =>
  pipe(
    Effect.promise<{ html: string; modules: Set<string> }>(() =>
      render(url, initialState)
    ),
    Effect.map(({ html: appHtml, modules }) => {
      const preloadLinks = generatePreloadLinks(modules, ssrManifest)
      let finalHtml = template.replace('<!--ssr-outlet-->', appHtml)

      if (preloadLinks) {
        finalHtml = finalHtml.replace('<head>', `<head>\n  ${preloadLinks}`)
      }

      return injectInitialState(finalHtml, initialState)
    })
  )
