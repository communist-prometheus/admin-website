/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect, pipe } from 'effect'
import type { ViteDevServer } from 'vite'
import type { InitialState } from '../../types/user'
import { prepareDevRender } from './render/dev-render'
import { buildHtml } from './render/html-builder'
import { prepareProdRender } from './render/production-render'
import { loadTemplate } from './render/template-loader'

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

const prepareRender = (
  url: string,
  template: string,
  isProduction: boolean,
  viteServer?: ViteDevServer
) =>
  isProduction
    ? prepareProdRender(template)
    : pipe(
        Effect.fromNullable(viteServer),
        Effect.mapError(() => new Error('Vite server not initialized')),
        Effect.flatMap(vite => prepareDevRender(url, template, vite))
      )

/**
 * Render a page with SSR
 */
export const renderPage = (
  url: string,
  config: RenderPageConfig,
  initialState?: InitialState
) =>
  pipe(
    loadTemplate(config.dirname, config.isProduction, config.clientManifest),
    Effect.flatMap(template =>
      prepareRender(url, template, config.isProduction, config.viteServer)
    ),
    Effect.flatMap(({ template, render }) =>
      buildHtml(template, render, url, initialState, config.ssrManifest)
    )
  )
