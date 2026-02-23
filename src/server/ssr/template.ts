import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ViteDevServer } from 'vite'
import type { InitialState } from '@/types/user'

/**
 * Loads and processes HTML template for production or development.
 * @param isProduction - Whether running in production mode
 * @param __dirname - Server directory path
 * @param viteServer - Vite dev server instance (dev only)
 * @param clientManifest - Client build manifest for asset injection (production only)
 * @returns Processed HTML template string
 */
export const loadTemplate = async (
  isProduction: boolean,
  __dirname: string,
  viteServer?: ViteDevServer,
  clientManifest?: Record<string, { file: string; css?: string[] }>
): Promise<string> => {
  let template = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8')

  if (isProduction) {
    const entryClient = clientManifest?.['src/entry-client.ts']
    if (entryClient) {
      const cssLinks =
        entryClient.css
          ?.map(css => `<link rel="stylesheet" href="/${css}">`)
          .join('\n  ') || ''
      if (cssLinks)
        template = template.replace('<head>', `<head>\n  ${cssLinks}`)
      template = template.replace(
        '<script type="module" src="/src/entry-client.ts"></script>',
        `<script type="module" src="/${entryClient.file}"></script>`
      )
    }
  } else if (viteServer) {
    template = await viteServer.transformIndexHtml('/', template)
  }

  return template
}

/**
 * Injects preload link tags into HTML head.
 * @param html - HTML string
 * @param links - Preload link tags to inject
 * @returns HTML with injected links
 */
export const injectPreloadLinks = (html: string, links: string): string =>
  links ? html.replace('<head>', `<head>\n  ${links}`) : html

/**
 * Injects initial state script into HTML for client hydration.
 * @param html - HTML string
 * @param state - Initial state data to serialize
 * @returns HTML with injected state script
 */
export const injectInitialState = (
  html: string,
  state?: InitialState
): string =>
  state
    ? html.replace(
        '</head>',
        `<script>window.__INITIAL_STATE__ = ${JSON.stringify(state)}</script>\n</head>`
      )
    : html
