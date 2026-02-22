/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Effect, pipe } from 'effect'
import type { ViteDevServer } from 'vite'
import type { InitialState } from '../../types/user'

/**
 * Render page configuration
 */
export interface RenderPageConfig {
  isProduction: boolean
  dirname: string
  viteServer?: ViteDevServer
  ssrManifest?: Record<string, string[]>
  clientManifest?: Record<string, { file: string; css?: string[] }>
}

/**
 * Generate preload links for CSS modules
 */
const generatePreloadLinks = (
  modules: Set<string>,
  ssrManifest?: Record<string, string[]>
): string => {
  if (!ssrManifest) return ''

  const cssFiles = new Set<string>()

  for (const moduleId of modules) {
    const assets = ssrManifest[moduleId]
    if (assets) {
      for (const asset of assets) {
        if (asset.endsWith('.css')) cssFiles.add(asset)
      }
    }
  }

  return Array.from(cssFiles)
    .map(file => `<link rel="stylesheet" href="${file}">`)
    .join('\n  ')
}

/**
 * Load production render function
 */
const loadProdRender = () =>
  Effect.promise(() =>
    import(
      // @ts-expect-error - build output not available in dev mode
      '../../../dist/server/entry-server.js'
    ).then(m => m.render)
  )

/**
 * Load development render function
 */
const loadDevRender = (viteServer: ViteDevServer) =>
  Effect.promise(() =>
    viteServer.ssrLoadModule('/src/entry-server.ts').then(m => m.render)
  )

/**
 * Process template with client manifest
 */
const processTemplate = (
  template: string,
  clientManifest?: Record<string, { file: string; css?: string[] }>
): string => {
  const entryClient = clientManifest?.['src/entry-client.ts']
  if (!entryClient) return template

  let result = template

  const cssLinks =
    entryClient.css
      ?.map(css => `<link rel="stylesheet" href="/${css}">`)
      .join('\n  ') || ''

  if (cssLinks) {
    result = result.replace('<head>', `<head>\n  ${cssLinks}`)
  }

  const scriptTag = `<script type="module" src="/${entryClient.file}"></script>`
  result = result.replace(
    '<script type="module" src="/src/entry-client.ts"></script>',
    scriptTag
  )

  return result
}

/**
 * Inject initial state into HTML
 */
const injectInitialState = (
  html: string,
  initialState?: InitialState
): string => {
  if (!initialState) return html

  const stateScript = `<script>window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}</script>`
  return html.replace('</head>', `${stateScript}\n</head>`)
}

/**
 * Render a page with SSR
 */
export const renderPage = (
  url: string,
  config: RenderPageConfig,
  initialState?: InitialState
) =>
  pipe(
    Effect.sync(() => {
      const { isProduction, dirname, viteServer, clientManifest } = config
      const template = readFileSync(
        resolve(dirname, '../index.html'),
        'utf-8'
      )

      return isProduction
        ? {
            template: processTemplate(template, clientManifest),
            isProduction,
            viteServer,
          }
        : { template, isProduction, viteServer }
    }),
    Effect.flatMap(({ template, isProduction, viteServer }) =>
      isProduction
        ? pipe(
            loadProdRender(),
            Effect.map(render => ({ template, render }))
          )
        : pipe(
            Effect.fromNullable(viteServer),
            Effect.mapError(() => new Error('Vite server not initialized')),
            Effect.flatMap(vite =>
              pipe(
                Effect.promise(() => vite.transformIndexHtml(url, template)),
                Effect.flatMap(transformedTemplate =>
                  pipe(
                    loadDevRender(vite),
                    Effect.map(render => ({
                      template: transformedTemplate,
                      render,
                    }))
                  )
                )
              )
            )
          )
    ),
    Effect.flatMap(({ template, render }) =>
      pipe(
        Effect.promise<{ html: string; modules: Set<string> }>(() =>
          render(url, initialState)
        ),
        Effect.map(({ html: appHtml, modules }) => {
          const preloadLinks = generatePreloadLinks(
            modules,
            config.ssrManifest
          )
          let finalHtml = template.replace('<!--ssr-outlet-->', appHtml)

          if (preloadLinks) {
            finalHtml = finalHtml.replace(
              '<head>',
              `<head>\n  ${preloadLinks}`
            )
          }

          return injectInitialState(finalHtml, initialState)
        })
      )
    )
  )
